"use server";

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { generateId } from "@better-auth/core/utils/id";

import { auth } from "@/lib/auth";
import prisma from "@/lib/dbClient/prisma";
import { postContentSchema } from "@/lib/zodSchema";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

type ActionResult = { ok: true } | { ok: false; error: string };

const requireUser = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user ?? null;
};

const storeUpload = async (image: File): Promise<string> => {
  const ext = MIME_TO_EXT[image.type];
  if (!ext) {
    throw new Error("Only JPG, PNG, WebP, or GIF images are allowed");
  }
  if (image.size > MAX_IMAGE_BYTES) {
    throw new Error("Image must be smaller than 5 MB");
  }
  const buffer = Buffer.from(await image.arrayBuffer());
  const fileName = `${generateId()}${ext}`;
  const uploadDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, fileName), buffer);
  return `/uploads/${fileName}`;
};

export const createPostAction = async (
  formData: FormData,
): Promise<ActionResult> => {
  const user = await requireUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to post" };
  }

  const parsed = postContentSchema.safeParse(formData.get("content"));
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid post",
    };
  }

  let imageUrl: string | null = null;
  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    try {
      imageUrl = await storeUpload(image);
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  await prisma.post.create({
    data: {
      id: generateId(),
      authorId: user.id,
      content: parsed.data,
      imageUrl,
    },
  });

  revalidatePath("/feed");
  revalidatePath("/dashboard");
  return { ok: true };
};

export const createReplyAction = async (
  parentId: string,
  content: string,
): Promise<ActionResult> => {
  const user = await requireUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to reply" };
  }

  const parsed = postContentSchema.safeParse(content);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid reply",
    };
  }

  const parent = await prisma.post.findUnique({
    where: { id: parentId },
    select: { id: true },
  });
  if (!parent) {
    return { ok: false, error: "Post not found" };
  }

  await prisma.post.create({
    data: {
      id: generateId(),
      authorId: user.id,
      content: parsed.data,
      parentId,
    },
  });

  revalidatePath(`/post/${parentId}`);
  revalidatePath("/feed");
  return { ok: true };
};

export const toggleLikeAction = async (
  postId: string,
): Promise<ActionResult> => {
  const user = await requireUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to like posts" };
  }

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId: user.id, postId } },
    select: { id: true },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, parentId: true },
    });
    if (!post) {
      return { ok: false, error: "Post not found" };
    }
    await prisma.like.create({
      data: { id: generateId(), userId: user.id, postId },
    });
    if (post.parentId) {
      revalidatePath(`/post/${post.parentId}`);
    }
  }

  revalidatePath("/feed");
  revalidatePath(`/post/${postId}`);
  return { ok: true };
};

export const deletePostAction = async (
  postId: string,
): Promise<ActionResult> => {
  const user = await requireUser();
  if (!user) {
    return { ok: false, error: "You must be signed in" };
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true, parentId: true },
  });
  if (!post) {
    return { ok: false, error: "Post not found" };
  }

  const isOwner = post.authorId === user.id;
  const isAdmin = user.role === "admin";
  if (!isOwner && !isAdmin) {
    return { ok: false, error: "You cannot delete this post" };
  }

  await prisma.post.delete({ where: { id: postId } });

  revalidatePath("/feed");
  revalidatePath("/dashboard");
  if (post.parentId) {
    revalidatePath(`/post/${post.parentId}`);
  }
  return { ok: true };
};

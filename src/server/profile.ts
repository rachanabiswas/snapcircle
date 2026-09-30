"use server";

import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { generateId } from "@better-auth/core/utils/id";

import { auth } from "@/lib/auth";
import prisma from "@/lib/dbClient/prisma";
import { updateProfileSchema } from "@/lib/zodSchema";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

type ActionResult = { ok: true } | { ok: false; error: string };

const requireUser = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user ?? null;
};

const storeAvatar = async (image: File): Promise<string> => {
  const ext = MIME_TO_EXT[image.type];
  if (!ext) {
    throw new Error("Only JPG, PNG, or WebP images are allowed");
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

const removeOldUpload = async (oldUrl: string | null) => {
  if (!oldUrl?.startsWith("/uploads/")) return;
  const fileName = oldUrl.replace("/uploads/", "");
  if (!fileName || fileName.includes("..") || fileName.includes("/")) return;
  try {
    await unlink(join(process.cwd(), "public", "uploads", fileName));
  } catch {
    return;
  }
};

export const updateProfileAction = async (
  formData: FormData,
): Promise<ActionResult> => {
  const user = await requireUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to edit your profile" };
  }

  const parsed = updateProfileSchema.safeParse({
    bio: formData.get("bio") ?? "",
    gender: formData.get("gender") ?? "prefer_not_to_say",
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid profile data",
    };
  }

  let imageUrl: string | undefined;
  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    try {
      imageUrl = await storeAvatar(image);
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  const current = await prisma.user.findUnique({
    where: { id: user.id },
    select: { image: true },
  });

  const bioText = parsed.data.bio.trim();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      bio: bioText.length === 0 ? null : bioText,
      gender: parsed.data.gender,
      ...(imageUrl ? { image: imageUrl } : {}),
    },
  });

  if (imageUrl && current?.image) {
    await removeOldUpload(current.image);
  }

  revalidatePath("/profile");
  revalidatePath("/feed");
  revalidatePath("/dashboard");
  return { ok: true };
};

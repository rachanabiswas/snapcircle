"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { generateId } from "@better-auth/core/utils/id";

import { auth } from "@/lib/auth";
import prisma from "@/lib/dbClient/prisma";

type ActionResult = { ok: true } | { ok: false; error: string };

const requireUser = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user ?? null;
};

const revalidateFollowViews = (targetId: string) => {
  revalidatePath("/feed");
  revalidatePath("/profile");
  revalidatePath(`/profile/${targetId}`);
};

export const followUserAction = async (
  targetId: string,
): Promise<ActionResult> => {
  const user = await requireUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to follow people" };
  }
  if (user.id === targetId) {
    return { ok: false, error: "You cannot follow yourself" };
  }

  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true },
  });
  if (!target) {
    return { ok: false, error: "User not found" };
  }

  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: user.id,
        followingId: targetId,
      },
    },
    create: {
      id: generateId(),
      followerId: user.id,
      followingId: targetId,
    },
    update: {},
  });

  revalidateFollowViews(targetId);
  return { ok: true };
};

export const unfollowUserAction = async (
  targetId: string,
): Promise<ActionResult> => {
  const user = await requireUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to unfollow people" };
  }

  await prisma.follow.deleteMany({
    where: { followerId: user.id, followingId: targetId },
  });

  revalidateFollowViews(targetId);
  return { ok: true };
};

"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { generateId } from "@better-auth/core/utils/id";
import { verifyPassword } from "better-auth/crypto";

import { auth } from "@/lib/auth";
import prisma from "@/lib/dbClient/prisma";
import {
  changeEmailSchema,
  notificationPrefsSchema,
  settingsProfileSchema,
} from "@/lib/zodSchema";

type ActionResult = { ok: true } | { ok: false; error: string };

const requireUser = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user ?? null;
};

// Nested settings pages live under /settings; revalidate the layout to cover them.
const revalidateSettingsPages = () => {
  revalidatePath("/settings", "layout");
};

export const updateSettingsProfileAction = async (
  formData: FormData,
): Promise<ActionResult> => {
  const user = await requireUser();
  if (!user) {
    return { ok: false, error: "You must be signed in" };
  }

  const parsed = settingsProfileSchema.safeParse({
    name: formData.get("name") ?? "",
    bio: formData.get("bio") ?? "",
    gender: formData.get("gender") ?? "prefer_not_to_say",
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid profile data",
    };
  }

  const bioText = parsed.data.bio.trim();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name.trim(),
      bio: bioText.length === 0 ? null : bioText,
      gender: parsed.data.gender,
    },
  });

  revalidateSettingsPages();
  revalidatePath("/profile");
  revalidatePath("/feed");
  return { ok: true };
};

export const changeEmailAction = async (
  formData: FormData,
): Promise<ActionResult> => {
  const user = await requireUser();
  if (!user) {
    return { ok: false, error: "You must be signed in" };
  }

  const parsed = changeEmailSchema.safeParse({
    newEmail: formData.get("newEmail") ?? "",
    currentPassword: formData.get("currentPassword") ?? "",
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid email data",
    };
  }

  const newEmail = parsed.data.newEmail.trim().toLowerCase();
  if (newEmail === user.email.toLowerCase()) {
    return { ok: false, error: "New email must be different" };
  }

  const existing = await prisma.user.findUnique({
    where: { email: newEmail },
    select: { id: true },
  });
  if (existing) {
    return { ok: false, error: "Email is already in use" };
  }

  const credential = await prisma.account.findFirst({
    where: { userId: user.id, providerId: "credential" },
    select: { password: true },
  });
  if (!credential?.password) {
    return {
      ok: false,
      error: "Password change is not available for this account",
    };
  }

  const valid = await verifyPassword({
    hash: credential.password,
    password: parsed.data.currentPassword,
  });
  if (!valid) {
    return { ok: false, error: "Current password is incorrect" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { email: newEmail, emailVerified: false },
  });

  revalidateSettingsPages();
  revalidatePath("/profile");
  return { ok: true };
};

export const getNotificationPrefsAction = async () => {
  const user = await requireUser();
  if (!user) return null;
  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId: user.id },
  });
  return (
    prefs ?? {
      likeNotifications: true,
      replyNotifications: true,
      pauseAll: false,
    }
  );
};

export const updateNotificationPrefsAction = async (
  formData: FormData,
): Promise<ActionResult> => {
  const user = await requireUser();
  if (!user) {
    return { ok: false, error: "You must be signed in" };
  }

  const parsed = notificationPrefsSchema.safeParse({
    likeNotifications: formData.get("likeNotifications") === "true",
    replyNotifications: formData.get("replyNotifications") === "true",
    pauseAll: formData.get("pauseAll") === "true",
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid preferences",
    };
  }

  await prisma.notificationPreference.upsert({
    where: { userId: user.id },
    create: {
      id: generateId(),
      userId: user.id,
      ...parsed.data,
    },
    update: parsed.data,
  });

  revalidateSettingsPages();
  revalidatePath("/notifications");
  return { ok: true };
};

export const exportUserDataAction = async (): Promise<
  { ok: true; data: unknown } | { ok: false; error: string }
> => {
  const user = await requireUser();
  if (!user) {
    return { ok: false, error: "You must be signed in" };
  }

  const full = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      posts: { orderBy: { createdAt: "desc" } },
      likes: true,
      notificationsReceived: { orderBy: { createdAt: "desc" }, take: 100 },
      sessions: {
        select: { id: true, createdAt: true, expiresAt: true, ipAddress: true },
      },
      notificationPreference: true,
    },
  });

  if (!full) {
    return { ok: false, error: "User not found" };
  }

  const { ...safe } = full;
  return {
    ok: true,
    data: {
      exportedAt: new Date().toISOString(),
      user: safe,
    },
  };
};

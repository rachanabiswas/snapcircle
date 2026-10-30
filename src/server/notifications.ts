"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import prisma from "@/lib/dbClient/prisma";
import {
  fetchNotificationItems,
  type FeedItem,
} from "@/lib/notificationsGrouping";

type ActionResult = { ok: true } | { ok: false; error: string };

const requireUser = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user ?? null;
};

export const markAsReadAction = async (
  ids: string[],
): Promise<ActionResult> => {
  const user = await requireUser();
  if (!user) {
    return { ok: false, error: "You must be signed in" };
  }
  if (ids.length === 0) {
    return { ok: true };
  }

  await prisma.notification.updateMany({
    where: {
      id: { in: ids },
      recipientId: user.id,
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  revalidatePath("/notifications");
  revalidatePath("/feed");
  return { ok: true };
};

export const markAllAsReadAction = async (): Promise<ActionResult> => {
  const user = await requireUser();
  if (!user) {
    return { ok: false, error: "You must be signed in" };
  }

  await prisma.notification.updateMany({
    where: { recipientId: user.id, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/notifications");
  revalidatePath("/feed");
  return { ok: true };
};

type NotificationsPage =
  | { ok: true; items: FeedItem[]; nextCursor: string | null }
  | { ok: false; error: string };

export const getNotificationsAction = async (
  cursor: string | null,
): Promise<NotificationsPage> => {
  const user = await requireUser();
  if (!user) {
    return { ok: false, error: "You must be signed in" };
  }

  // A stale cursor (e.g. the anchor notification was deleted between
  // batches) is expected to fail; surface it as a retryable error instead
  // of crashing.
  try {
    const { items, nextCursor } = await fetchNotificationItems(user.id, cursor);
    return { ok: true, items, nextCursor };
  } catch {
    return {
      ok: false,
      error: "Could not load more notifications. Please try again.",
    };
  }
};

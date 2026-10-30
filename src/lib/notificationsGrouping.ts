import prisma from "@/lib/dbClient/prisma";

export const NOTIFICATIONS_PAGE_SIZE = 50;

export type LikeGroupItem = {
  kind: "like";
  ids: string[];
  postId: string;
  postContent: string;
  postImageUrl: string | null;
  actors: { name: string; image: string | null }[];
  unread: boolean;
  createdAt: string;
};

export type ReplyItem = {
  kind: "reply";
  id: string;
  postId: string;
  postContent: string;
  postImageUrl: string | null;
  actor: { name: string; image: string | null };
  replyContent: string;
  unread: boolean;
  createdAt: string;
};

export type FeedItem = LikeGroupItem | ReplyItem;

export type NotificationCounts = {
  all: number;
  likes: number;
  replies: number;
};

export const fetchNotificationItems = async (
  userId: string,
  cursor: string | null,
): Promise<{ items: FeedItem[]; nextCursor: string | null }> => {
  // IDs are random generateId() strings, so the cursor must go through
  // Prisma's cursor mode (row-level anchor), not an "id < cursor" comparison.
  const rows = await prisma.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: "desc" },
    take: NOTIFICATIONS_PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      actor: { select: { id: true, name: true, image: true } },
      post: {
        select: { id: true, content: true, imageUrl: true },
      },
      reply: { select: { id: true, content: true } },
    },
  });

  const nextCursor =
    rows.length > NOTIFICATIONS_PAGE_SIZE ?
      rows[NOTIFICATIONS_PAGE_SIZE].id
    : null;
  const pageRows = rows.slice(0, NOTIFICATIONS_PAGE_SIZE);

  const likeGroups = new Map<
    string,
    {
      ids: string[];
      postId: string;
      postContent: string;
      postImageUrl: string | null;
      actors: { id: string; name: string; image: string | null }[];
      unread: boolean;
      createdAt: string;
    }
  >();

  for (const row of pageRows) {
    if (row.type !== "LIKE" || !row.post) continue;
    const key = row.post.id;
    const group = likeGroups.get(key);
    if (!group) {
      likeGroups.set(key, {
        ids: [row.id],
        postId: row.post.id,
        postContent: row.post.content,
        postImageUrl: row.post.imageUrl,
        actors: [
          {
            id: row.actor.id,
            name: row.actor.name,
            image: row.actor.image,
          },
        ],
        unread: row.readAt === null,
        createdAt: row.createdAt.toISOString(),
      });
    } else {
      group.ids.push(row.id);
      if (!group.actors.some((a) => a.id === row.actor.id)) {
        group.actors.push({
          id: row.actor.id,
          name: row.actor.name,
          image: row.actor.image,
        });
      }
      if (row.readAt === null) group.unread = true;
    }
  }

  const items: FeedItem[] = [];

  for (const group of likeGroups.values()) {
    items.push({
      kind: "like",
      ids: group.ids,
      postId: group.postId,
      postContent: group.postContent,
      postImageUrl: group.postImageUrl,
      actors: group.actors.map(({ name, image }) => ({ name, image })),
      unread: group.unread,
      createdAt: group.createdAt,
    });
  }

  for (const row of pageRows) {
    if (row.type !== "REPLY" || !row.post) continue;
    items.push({
      kind: "reply",
      id: row.id,
      postId: row.post.id,
      postContent: row.post.content,
      postImageUrl: row.post.imageUrl,
      actor: { name: row.actor.name, image: row.actor.image },
      replyContent: row.reply?.content ?? "New reply on your post",
      unread: row.readAt === null,
      createdAt: row.createdAt.toISOString(),
    });
  }

  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return { items, nextCursor };
};

export const fetchNotificationCounts = async (
  userId: string,
): Promise<NotificationCounts> => {
  const groups = await prisma.notification.groupBy({
    by: ["type"],
    where: { recipientId: userId },
    _count: { _all: true },
  });

  const likes = groups.find((group) => group.type === "LIKE")?._count._all ?? 0;
  const replies =
    groups.find((group) => group.type === "REPLY")?._count._all ?? 0;

  return { all: likes + replies, likes, replies };
};

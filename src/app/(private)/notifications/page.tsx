import { headers } from "next/headers";

import NotificationsList, {
  type FeedItem,
} from "@/components/Notifications/NotificationsList";
import { auth } from "@/lib/auth";
import prisma from "@/lib/dbClient/prisma";

export const metadata = {
  title: "Notifications",
  description: "Your SnapCircle notifications",
};

const NotificationsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const currentUserId = session?.user.id ?? "";

  const rows =
    currentUserId ?
      await prisma.notification.findMany({
        where: { recipientId: currentUserId },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          actor: { select: { id: true, name: true, image: true } },
          post: {
            select: { id: true, content: true, imageUrl: true },
          },
          reply: { select: { id: true, content: true } },
        },
      })
    : [];

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

  for (const row of rows) {
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

  for (const row of rows) {
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

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <p className="text-muted-foreground">Likes and replies to your posts</p>
      </div>
      <NotificationsList items={items} />
    </main>
  );
};

export default NotificationsPage;

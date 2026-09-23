import Link from "next/link";
import { headers } from "next/headers";

import ComposeBox from "@/components/Feed/ComposeBox";
import PostCard, { type PostCardPost } from "@/components/Feed/PostCard";
import TimeAgo from "@/components/Feed/TimeAgo";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcnui/avatar";
import { Badge } from "@/components/shadcnui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { auth } from "@/lib/auth";
import prisma from "@/lib/dbClient/prisma";

export const metadata = {
  title: "Feed",
  description: "Latest posts from your SnapCircle",
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const FeedPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const currentUser = session?.user;
  const currentUserId = currentUser?.id ?? "";

  const [posts, popular, newestMembers] = await Promise.all([
    prisma.post.findMany({
      where: { parentId: null },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        author: { select: { id: true, name: true, image: true } },
        _count: { select: { likes: true, replies: true } },
        likes: {
          where: { userId: currentUserId },
          select: { id: true },
        },
      },
    }),
    prisma.post.findMany({
      where: { parentId: null },
      orderBy: [{ likes: { _count: "desc" } }, { createdAt: "desc" }],
      take: 3,
      include: {
        author: { select: { name: true } },
        _count: { select: { likes: true } },
      },
    }),
    prisma.user.findMany({
      where: { id: { not: currentUserId } },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, name: true, image: true, createdAt: true },
    }),
  ]);

  const cards: PostCardPost[] = posts.map((post) => ({
    id: post.id,
    content: post.content,
    imageUrl: post.imageUrl,
    createdAt: post.createdAt.toISOString(),
    author: {
      name: post.author.name,
      image: post.author.image,
    },
    likeCount: post._count.likes,
    replyCount: post._count.replies,
    liked: post.likes.length > 0,
    isOwner: post.author.id === currentUserId,
  }));

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Feed</h1>
        <p className="text-muted-foreground">Latest posts from your circle</p>
      </div>

      <ComposeBox
        user={{
          name: currentUser?.name ?? null,
          email: currentUser?.email ?? null,
          image: currentUser?.image ?? null,
        }}
      />

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[1fr_300px]">
        <div className="grid min-w-0 items-start gap-4 sm:grid-cols-2">
          {cards.length === 0 ?
            <Card className="sm:col-span-2">
              <CardHeader>
                <CardTitle>No posts yet</CardTitle>
                <CardDescription>
                  Be the first to share something with your circle.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Write a post above to get the conversation started.
                </p>
              </CardContent>
            </Card>
          : cards.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                layout="grid"
              />
            ))
          }
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Popular right now</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {popular.length === 0 ?
                <p className="text-muted-foreground text-sm">
                  Nothing trending yet. Like a post to get it started.
                </p>
              : popular.map((post) => (
                  <Link
                    key={post.id}
                    href={`/post/${post.id}`}
                    className="group flex items-center justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium group-hover:underline">
                        {post.content}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {post.author.name}
                      </span>
                    </span>
                    <Badge
                      variant="secondary"
                      className="shrink-0">
                      {post._count.likes} likes
                    </Badge>
                  </Link>
                ))
              }
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">New in your circle</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {newestMembers.length === 0 ?
                <p className="text-muted-foreground text-sm">
                  You are the first one here.
                </p>
              : newestMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3">
                    <Avatar size="sm">
                      {member.image && (
                        <AvatarImage
                          src={member.image}
                          alt={`${member.name} avatar`}
                        />
                      )}
                      <AvatarFallback>
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col leading-tight">
                      <span className="truncate text-sm font-medium">
                        {member.name}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        joined <TimeAgo iso={member.createdAt.toISOString()} />
                      </span>
                    </div>
                  </div>
                ))
              }
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
};

export default FeedPage;

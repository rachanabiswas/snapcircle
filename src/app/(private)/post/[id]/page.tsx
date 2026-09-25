import { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import PostCard, { type PostCardPost } from "@/components/Feed/PostCard";
import ReplyForm from "@/components/Feed/ReplyForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { Separator } from "@/components/shadcnui/separator";
import { auth } from "@/lib/auth";
import prisma from "@/lib/dbClient/prisma";

export const metadata: Metadata = {
  title: "Post",
  description: "View a post and its replies",
};

type ThreadPageProps = {
  params: Promise<{ id: string }>;
};

const toCard = (
  post: {
    id: string;
    content: string;
    imageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    author: { id: string; name: string; image: string | null; email: string };
    _count: { likes: number; replies: number };
    likes: { id: string }[];
  },
  currentUserId: string,
): PostCardPost => ({
  id: post.id,
  content: post.content,
  imageUrl: post.imageUrl,
  createdAt: post.createdAt.toISOString(),
  updatedAt: post.updatedAt.toISOString(),
  author: {
    name: post.author.name,
    image: post.author.image,
    email: post.author.email,
  },
  likeCount: post._count.likes,
  replyCount: post._count.replies,
  liked: post.likes.length > 0,
  isOwner: post.author.id === currentUserId,
});

const ThreadPage = async ({ params }: ThreadPageProps) => {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const currentUserId = session?.user.id ?? "";

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, image: true, email: true } },
      _count: { select: { likes: true, replies: true } },
      likes: {
        where: { userId: currentUserId },
        select: { id: true },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const replies = await prisma.post.findMany({
    where: { parentId: id },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { id: true, name: true, image: true, email: true } },
      _count: { select: { likes: true, replies: true } },
      likes: {
        where: { userId: currentUserId },
        select: { id: true },
      },
    },
  });

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-8">
      <PostCard post={toCard(post, currentUserId)} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Replies</CardTitle>
        </CardHeader>
        <CardContent>
          <ReplyForm parentId={post.id} />
        </CardContent>
      </Card>

      {replies.length > 0 && (
        <div className="flex flex-col gap-4">
          <Separator />
          {replies.map((reply) => (
            <PostCard
              key={reply.id}
              post={toCard(reply, currentUserId)}
            />
          ))}
        </div>
      )}
    </main>
  );
};

export default ThreadPage;

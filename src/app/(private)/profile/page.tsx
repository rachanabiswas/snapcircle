import { headers } from "next/headers";

import PostCard, { type PostCardPost } from "@/components/Feed/PostCard";
import ProfileSection from "@/components/Profile/ProfileSection";
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
  title: "Profile",
  description: "Your SnapCircle profile",
};

const ProfilePage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const sessionUser = session?.user;
  const currentUserId = sessionUser?.id ?? "";

  const user =
    currentUserId ?
      await prisma.user.findUnique({
        where: { id: currentUserId },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
          gender: true,
        },
      })
    : null;

  if (!user) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-muted-foreground">
          Please sign in to view your profile.
        </p>
      </main>
    );
  }

  const [postsCount, likesReceived, posts] = await Promise.all([
    prisma.post.count({
      where: { authorId: user.id, parentId: null },
    }),
    prisma.like.count({
      where: { post: { authorId: user.id } },
    }),
    prisma.post.findMany({
      where: { authorId: user.id, parentId: null },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        author: { select: { id: true, name: true, image: true, email: true } },
        _count: { select: { likes: true, replies: true } },
        likes: {
          where: { userId: user.id },
          select: { id: true },
        },
      },
    }),
  ]);

  const cards: PostCardPost[] = posts.map((post) => ({
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
    isOwner: true,
  }));

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-muted-foreground">Your personal page</p>
      </div>

      <ProfileSection
        user={{
          name: user.name,
          email: user.email,
          image: user.image,
          bio: user.bio,
          gender: user.gender,
        }}
      />

      <div className="mt-4 grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{postsCount}</CardTitle>
            <CardDescription>Posts</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{likesReceived}</CardTitle>
            <CardDescription>Likes received</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">Your recent posts</h2>
        {cards.length === 0 ?
          <Card>
            <CardHeader>
              <CardTitle>No posts yet</CardTitle>
              <CardDescription>
                Share your first post from the feed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Your latest 10 posts will show here.
              </p>
            </CardContent>
          </Card>
        : <div className="grid min-w-0 items-start gap-4 sm:grid-cols-2">
            {cards.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                layout="grid"
              />
            ))}
          </div>
        }
      </div>
    </main>
  );
};

export default ProfilePage;

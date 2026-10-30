import { headers } from "next/headers";

import PostCard, { type PostCardPost } from "@/components/Feed/PostCard";
import PageContainer from "@/components/Layout/PageContainer";
import ProfileSection from "@/components/Profile/ProfileSection";
import ProfileStats from "@/components/Profile/ProfileStats";
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
          _count: { select: { followers: true, following: true } },
        },
      })
    : null;

  if (!user) {
    return (
      <PageContainer className="max-w-7xl">
        <p className="text-muted-foreground">
          Please sign in to view your profile.
        </p>
      </PageContainer>
    );
  }

  const [postsCount, likesReceived, posts, followerRows, followingRows] =
    await Promise.all([
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
          author: {
            select: { id: true, name: true, image: true, email: true },
          },
          _count: { select: { likes: true, replies: true } },
          likes: {
            where: { userId: user.id },
            select: { id: true },
          },
        },
      }),
      prisma.follow.findMany({
        where: { followingId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          follower: {
            select: { id: true, name: true, image: true, bio: true },
          },
        },
      }),
      prisma.follow.findMany({
        where: { followerId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          following: {
            select: { id: true, name: true, image: true, bio: true },
          },
        },
      }),
    ]);

  const followerIds = followerRows.map((row) => row.follower.id);
  const followedBack =
    followerIds.length > 0 ?
      await prisma.follow.findMany({
        where: {
          followerId: user.id,
          followingId: { in: followerIds },
        },
        select: { followingId: true },
      })
    : [];

  const followedBackIds = new Set(followedBack.map((row) => row.followingId));

  const followers = followerRows.map((row) => ({
    ...row.follower,
    viewerFollowing: followedBackIds.has(row.follower.id),
  }));
  const following = followingRows.map((row) => ({
    ...row.following,
    viewerFollowing: true,
  }));

  const cards: PostCardPost[] = posts.map((post) => ({
    id: post.id,
    content: post.content,
    imageUrl: post.imageUrl,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    author: {
      id: post.author.id,
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
    <PageContainer className="max-w-7xl">
      <ProfileSection
        user={{
          name: user.name,
          email: user.email,
          image: user.image,
          bio: user.bio,
          gender: user.gender,
        }}
      />

      <ProfileStats
        postsCount={postsCount}
        likesReceived={likesReceived}
        followersCount={user._count.followers}
        followingCount={user._count.following}
        followers={followers}
        following={following}
        viewerId={user.id}
        emptyFollowers="You do not have any followers yet."
        emptyFollowing="You are not following anyone yet."
      />

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
    </PageContainer>
  );
};

export default ProfilePage;

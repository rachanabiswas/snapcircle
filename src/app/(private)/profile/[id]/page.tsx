import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import PostCard, { type PostCardPost } from "@/components/Feed/PostCard";
import PageContainer from "@/components/Layout/PageContainer";
import ProfileStats from "@/components/Profile/ProfileStats";
import PublicProfileHeader from "@/components/Profile/PublicProfileHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { auth } from "@/lib/auth";
import prisma from "@/lib/dbClient/prisma";

type ProfilePageProps = {
  params: Promise<{ id: string }>;
};

export const generateMetadata = async ({
  params,
}: ProfilePageProps): Promise<Metadata> => {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { name: true, bio: true },
  });

  if (!user) {
    return { title: "Profile" };
  }

  return {
    title: user.name,
    description: user.bio ?? `${user.name} on SnapCircle`,
  };
};

const PublicProfilePage = async ({ params }: ProfilePageProps) => {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const currentUserId = session?.user.id ?? "";

  if (currentUserId === id) {
    redirect("/profile");
  }

  const [user, postsCount, likesReceived] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        image: true,
        bio: true,
        gender: true,
        _count: { select: { followers: true, following: true } },
      },
    }),
    prisma.post.count({ where: { authorId: id, parentId: null } }),
    prisma.like.count({ where: { post: { authorId: id } } }),
  ]);

  if (!user) {
    notFound();
  }

  const [posts, followerRows, followingRows, viewerFollow] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: id, parentId: null },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        author: { select: { id: true, name: true, image: true, email: true } },
        _count: { select: { likes: true, replies: true } },
        likes: {
          where: { userId: currentUserId },
          select: { id: true },
        },
      },
    }),
    prisma.follow.findMany({
      where: { followingId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        follower: {
          select: { id: true, name: true, image: true, bio: true },
        },
      },
    }),
    prisma.follow.findMany({
      where: { followerId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        following: {
          select: { id: true, name: true, image: true, bio: true },
        },
      },
    }),
    currentUserId ?
      prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: id,
          },
        },
        select: { id: true },
      })
    : null,
  ]);

  const knownIds = [
    ...followerRows.map((row) => row.follower.id),
    ...followingRows.map((row) => row.following.id),
  ];

  const viewerFollows =
    currentUserId && knownIds.length > 0 ?
      await prisma.follow.findMany({
        where: {
          followerId: currentUserId,
          followingId: { in: knownIds },
        },
        select: { followingId: true },
      })
    : [];

  const viewerFollowingIds = new Set(
    viewerFollows.map((follow) => follow.followingId),
  );

  const followers = followerRows.map((row) => ({
    ...row.follower,
    viewerFollowing: viewerFollowingIds.has(row.follower.id),
  }));
  const following = followingRows.map((row) => ({
    ...row.following,
    viewerFollowing: viewerFollowingIds.has(row.following.id),
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
    isOwner: post.author.id === currentUserId,
  }));

  return (
    <PageContainer className="max-w-7xl">
      <PublicProfileHeader
        user={{
          id: user.id,
          name: user.name,
          image: user.image,
          bio: user.bio,
          gender: user.gender,
        }}
        isFollowing={!!viewerFollow}
      />

      <ProfileStats
        postsCount={postsCount}
        likesReceived={likesReceived}
        followersCount={user._count.followers}
        followingCount={user._count.following}
        followers={followers}
        following={following}
        viewerId={currentUserId}
        emptyFollowers={`${user.name} does not have any followers yet.`}
        emptyFollowing={`${user.name} is not following anyone yet.`}
      />

      <div className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">
          {user.name}&apos;s recent posts
        </h2>
        {cards.length === 0 ?
          <Card>
            <CardHeader>
              <CardTitle>No posts yet</CardTitle>
              <CardDescription>
                {user.name} has not shared anything yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Their latest posts will show here.
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

export default PublicProfilePage;

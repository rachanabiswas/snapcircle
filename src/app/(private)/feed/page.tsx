import Link from "next/link";
import { headers } from "next/headers";

import ComposeBox from "@/components/Feed/ComposeBox";
import FeedStream from "@/components/Feed/FeedStream";
import FollowersStrip from "@/components/Feed/FollowersStrip";
import TimeAgo from "@/components/Feed/TimeAgo";
import PageContainer from "@/components/Layout/PageContainer";
import FollowButton from "@/components/Profile/FollowButton";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcnui/avatar";
import { Badge } from "@/components/shadcnui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { auth } from "@/lib/auth";
import prisma from "@/lib/dbClient/prisma";
import { getFeedPage, getFeedPopular } from "@/lib/feedPosts";

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

  const [popular, followerRows, feed] = await Promise.all([
    getFeedPopular(),
    currentUserId ?
      prisma.follow.findMany({
        where: { followingId: currentUserId },
        orderBy: { createdAt: "desc" },
        take: 12,
        select: {
          follower: { select: { id: true, name: true, image: true } },
        },
      })
    : [],
    getFeedPage(currentUserId, null),
  ]);

  const followers = followerRows.map((row) => row.follower);

  const newestMembers = await prisma.user.findMany({
    where: { id: { not: currentUserId } },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: { id: true, name: true, image: true, createdAt: true },
  });

  const stripMembers =
    followers.length > 0 ?
      followers
    : newestMembers.map(({ id, name, image }) => ({ id, name, image }));

  const suggestedMembers = await prisma.user.findMany({
    where: {
      id: { notIn: [currentUserId, ...newestMembers.map((m) => m.id)] },
      NOT: { followers: { some: { followerId: currentUserId } } },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { id: true, name: true, image: true },
  });

  return (
    <PageContainer className="max-w-7xl py-6">
      <FollowersStrip
        members={stripMembers}
        isFallback={followers.length === 0}
      />

      <div className="mt-3">
        <ComposeBox
          user={{
            name: currentUser?.name ?? null,
            email: currentUser?.email ?? null,
            image: currentUser?.image ?? null,
          }}
        />
      </div>

      <div className="mt-3 grid grid-cols-1 items-start gap-3 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <FeedStream
            initialPosts={feed.posts}
            initialCursor={feed.nextCursor}
          />
        </div>

        <aside className="flex flex-col gap-3 lg:sticky lg:top-16">
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Who to follow</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {suggestedMembers.length === 0 ?
                <p className="text-muted-foreground text-sm">
                  You already know the whole circle.
                </p>
              : suggestedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3">
                    <Link
                      href={`/profile/${member.id}`}
                      className="shrink-0"
                      aria-label={`View ${member.name}'s profile`}>
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
                    </Link>
                    <Link
                      href={`/profile/${member.id}`}
                      className="min-w-0 flex-1 leading-tight">
                      <span className="block truncate text-sm font-medium hover:underline">
                        {member.name}
                      </span>
                    </Link>
                    <FollowButton
                      targetId={member.id}
                      initialFollowing={false}
                      size="xs"
                    />
                  </div>
                ))
              }
            </CardContent>
          </Card>
        </aside>
      </div>
    </PageContainer>
  );
};

export default FeedPage;

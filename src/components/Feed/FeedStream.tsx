"use client";

import { useEffect, useRef, useState } from "react";

import useInfiniteCursor from "@/hooks/useInfiniteCursor";
import PostCard, { type PostCardPost } from "@/components/Feed/PostCard";
import { Button } from "@/components/shadcnui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { Spinner } from "@/components/shadcnui/spinner";
import { getFeedPostsAction } from "@/server/posts";

type FeedStreamProps = {
  initialPosts: PostCardPost[];
  initialCursor: string | null;
};

const FeedStream = ({ initialPosts, initialCursor }: FeedStreamProps) => {
  const [posts, setPosts] = useState<PostCardPost[]>(initialPosts);

  // Server actions revalidate and send fresh page-1 data; merge it in so
  // composed and deleted posts are reflected without losing appended pages.
  // Only items outside the previous page-1 scope are kept from local state,
  // so posts the fresh page no longer contains (e.g. deleted) are dropped.
  const serverPostsRef = useRef(initialPosts);
  useEffect(() => {
    if (initialPosts === serverPostsRef.current) return;
    const previousPosts = serverPostsRef.current;
    serverPostsRef.current = initialPosts;
    const previousIds = new Set(previousPosts.map((post) => post.id));
    setPosts((prev) =>
      prev === previousPosts ? initialPosts : (
        [...initialPosts, ...prev.filter((post) => !previousIds.has(post.id))]
      ),
    );
  }, [initialPosts]);

  const { sentinelRef, hasMore, isLoading, error, loadMore } =
    useInfiniteCursor<PostCardPost>({
      initialCursor,
      fetchPage: getFeedPostsAction,
      onAppend: (newPosts) => setPosts((prev) => [...prev, ...newPosts]),
    });

  if (posts.length === 0) {
    return (
      <Card>
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
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            layout="grid"
          />
        ))}
        <div
          ref={sentinelRef}
          aria-hidden="true"
          className="col-span-full h-px"
        />
      </div>

      <div className="flex flex-col items-center gap-2 py-1 text-center">
        {error && (
          <>
            <p
              role="alert"
              className="text-muted-foreground text-sm">
              {error}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadMore()}>
              Try again
            </Button>
          </>
        )}
        {isLoading && (
          <span className="text-muted-foreground flex items-center gap-2 text-sm">
            <Spinner />
            Loading more posts
          </span>
        )}
        {!isLoading && !error && !hasMore && (
          <p className="text-muted-foreground text-sm">
            You&apos;re all caught up
          </p>
        )}
      </div>
    </div>
  );
};

export default FeedStream;

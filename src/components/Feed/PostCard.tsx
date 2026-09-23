"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { HeartIcon, MessageCircleIcon, Trash2Icon } from "lucide-react";

import { deletePostAction, toggleLikeAction } from "@/server/posts";
import TimeAgo from "@/components/Feed/TimeAgo";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcnui/avatar";
import { Button, buttonVariants } from "@/components/shadcnui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/shadcnui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcnui/dialog";
import { toast } from "@/components/shadcnui/toast";
import { cn } from "@/lib/utils";

export type PostCardPost = {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  author: {
    name: string;
    image: string | null;
  };
  likeCount: number;
  replyCount: number;
  liked: boolean;
  isOwner: boolean;
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const PostCard = ({
  post,
  layout = "standard",
}: {
  post: PostCardPost;
  layout?: "standard" | "grid";
}) => {
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [likePending, setLikePending] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePending, setDeletePending] = useState(false);

  const handleLike = async () => {
    if (likePending) return;
    setLikePending(true);
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    const result = await toggleLikeAction(post.id);
    if (!result.ok) {
      setLiked(post.liked);
      setLikeCount(post.likeCount);
      toast.add({
        title: "Could not like post",
        description: result.error,
        type: "error",
      });
    }
    setLikePending(false);
  };

  const handleDelete = async () => {
    setDeletePending(true);
    const result = await deletePostAction(post.id);
    if (!result.ok) {
      toast.add({
        title: "Could not delete post",
        description: result.error,
        type: "error",
      });
      setDeletePending(false);
      return;
    }
    setDeleteOpen(false);
    toast.add({
      title: "Deleted",
      description: "Your post was deleted",
      type: "success",
    });
  };

  const isGrid = layout === "grid";

  return (
    <Card className={cn(isGrid && "overflow-hidden")}>
      {isGrid &&
        (post.imageUrl ?
          <Link
            href={`/post/${post.id}`}
            className="block">
            <Image
              src={post.imageUrl}
              alt="Post attachment"
              width={800}
              height={450}
              className="h-44 w-full object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </Link>
        : <div className="bg-muted flex h-44 items-center justify-center p-6">
            <p className="line-clamp-4 text-center text-lg font-medium">
              &ldquo;{post.content}&rdquo;
            </p>
          </div>)}
      <CardHeader className={cn(isGrid && "pb-0")}>
        <div className="flex items-center gap-3">
          <Avatar size={isGrid ? "sm" : "default"}>
            {post.author.image && (
              <AvatarImage
                src={post.author.image}
                alt={`${post.author.name} avatar`}
              />
            )}
            <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-medium">{post.author.name}</span>
            <span className="text-muted-foreground text-xs">
              <TimeAgo iso={post.createdAt} />
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn(isGrid && "pb-0")}>
        {(!isGrid || post.imageUrl) && (
          <p
            className={cn(
              "whitespace-pre-wrap",
              isGrid && "line-clamp-3 text-sm",
            )}>
            {post.content}
          </p>
        )}
        {!isGrid && post.imageUrl && (
          <Link
            href={`/post/${post.id}`}
            className="mt-3 block">
            <Image
              src={post.imageUrl}
              alt="Post attachment"
              width={1200}
              height={800}
              className="h-auto w-full rounded-lg object-cover"
              sizes="(max-width: 768px) 100vw, 700px"
            />
          </Link>
        )}
      </CardContent>

      <CardFooter className="gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={likePending}
          aria-pressed={liked}
          aria-label={liked ? "Unlike post" : "Like post"}>
          <HeartIcon
            data-icon="inline-start"
            aria-hidden="true"
            className={cn(liked && "fill-destructive text-destructive")}
          />
          {likeCount}
        </Button>
        <Link
          href={`/post/${post.id}`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          aria-label="View replies">
          <MessageCircleIcon
            data-icon="inline-start"
            aria-hidden="true"
          />
          {post.replyCount}
        </Link>
        {post.isOwner && (
          <Dialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}>
            <DialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete post"
                  className="ml-auto"
                />
              }>
              <Trash2Icon aria-hidden="true" />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete this post?</DialogTitle>
                <DialogDescription>
                  This removes the post and its replies for everyone. This
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteOpen(false)}
                  disabled={deletePending}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deletePending}>
                  {deletePending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
};

export default PostCard;

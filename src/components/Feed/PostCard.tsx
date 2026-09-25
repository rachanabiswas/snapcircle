"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  HeartIcon,
  MessageCircleIcon,
  MoreHorizontalIcon,
  Share2Icon,
  Trash2Icon,
} from "lucide-react";

import { deletePostAction, toggleLikeAction } from "@/server/posts";
import TimeAgo from "@/components/Feed/TimeAgo";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcnui/avatar";
import { Badge } from "@/components/shadcnui/badge";
import { Button, buttonVariants } from "@/components/shadcnui/button";
import {
  Card,
  CardAction,
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
} from "@/components/shadcnui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcnui/dropdown-menu";
import { toast } from "@/components/shadcnui/toast";
import { cn } from "@/lib/utils";

export type PostCardPost = {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt?: string | null;
  author: {
    name: string;
    image: string | null;
    email?: string | null;
  };
  likeCount: number;
  replyCount: number;
  liked: boolean;
  isOwner: boolean;
  isPopular?: boolean;
};

const TAG_RE = /#[\p{L}\p{N}_]+/gu;

const extractTags = (content: string) => {
  const found = content.match(TAG_RE) ?? [];
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const raw of found) {
    const tag = raw.slice(1).toLowerCase();
    if (!seen.has(tag) && tags.length < 5) {
      seen.add(tag);
      tags.push(tag);
    }
  }
  return tags;
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const getHandle = (email?: string | null) => {
  if (!email) return null;
  const prefix = email.split("@")[0]?.trim().toLowerCase();
  if (!prefix) return null;
  return prefix.replace(/[^a-z0-9_.]/g, "").slice(0, 30) || null;
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

  const handle = getHandle(post.author.email);
  const tags = extractTags(post.content);
  const isEdited =
    !!post.updatedAt &&
    new Date(post.updatedAt).getTime() - new Date(post.createdAt).getTime() >
      60 * 1000;
  const isGrid = layout === "grid";

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

  const handleShare = async () => {
    const url =
      typeof window === "undefined" ?
        `/post/${post.id}`
      : `${window.location.origin}/post/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.add({
        title: "Link copied",
        description: "Post link is ready to share",
        type: "success",
      });
    } catch {
      toast.add({
        title: "Could not copy link",
        description: url,
        type: "error",
      });
    }
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

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
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
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="flex items-center gap-2">
              <span className="truncate font-medium">{post.author.name}</span>
              {post.isPopular && (
                <Badge
                  variant="secondary"
                  className="shrink-0">
                  Popular
                </Badge>
              )}
            </span>
            <span className="text-muted-foreground truncate text-xs">
              {handle ? `@${handle} · ` : ""}
              <TimeAgo iso={post.createdAt} />
              {isEdited && " · Edited"}
            </span>
          </div>
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Post options"
                  />
                }>
                <MoreHorizontalIcon aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side="bottom"
                sideOffset={8}
                className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuItem render={<Link href={`/post/${post.id}`} />}>
                    <MessageCircleIcon
                      data-icon="inline-start"
                      aria-hidden="true"
                    />
                    View post
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2Icon
                      data-icon="inline-start"
                      aria-hidden="true"
                    />
                    Copy link
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                {post.isOwner && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
                        <Trash2Icon
                          data-icon="inline-start"
                          aria-hidden="true"
                        />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
        {post.imageUrl && (
          <Link
            href={`/post/${post.id}`}
            className="mt-3 block overflow-hidden rounded-lg">
            <Image
              src={post.imageUrl}
              alt={`Photo shared by ${post.author.name}`}
              width={isGrid ? 800 : 1200}
              height={isGrid ? 450 : 800}
              className="aspect-video w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
              sizes={
                isGrid ?
                  "(max-width: 768px) 100vw, 400px"
                : "(max-width: 768px) 100vw, 700px"
              }
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
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          aria-label="Share post">
          <Share2Icon
            data-icon="inline-start"
            aria-hidden="true"
          />
          Share
        </Button>
      </CardFooter>

      <Dialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this post?</DialogTitle>
            <DialogDescription>
              This removes the post and its replies for everyone. This cannot be
              undone.
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
    </Card>
  );
};

export default PostCard;

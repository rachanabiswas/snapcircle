"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  CheckCheckIcon,
  CheckIcon,
  HeartIcon,
  MessageCircleIcon,
} from "lucide-react";

import { markAllAsReadAction, markAsReadAction } from "@/server/notifications";
import TimeAgo from "@/components/Feed/TimeAgo";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcnui/avatar";
import { Badge } from "@/components/shadcnui/badge";
import { Button } from "@/components/shadcnui/button";
import { Card, CardContent } from "@/components/shadcnui/card";
import { Separator } from "@/components/shadcnui/separator";
import { toast } from "@/components/shadcnui/toast";
import { cn } from "@/lib/utils";

export type LikeGroupItem = {
  kind: "like";
  ids: string[];
  postId: string;
  postContent: string;
  postImageUrl: string | null;
  actors: { name: string; image: string | null }[];
  unread: boolean;
  createdAt: string;
};

export type ReplyItem = {
  kind: "reply";
  id: string;
  postId: string;
  postContent: string;
  postImageUrl: string | null;
  actor: { name: string; image: string | null };
  replyContent: string;
  unread: boolean;
  createdAt: string;
};

export type FeedItem = LikeGroupItem | ReplyItem;

type Filter = "all" | "likes" | "replies";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const likeText = (actors: LikeGroupItem["actors"]) => {
  if (actors.length === 1) return `${actors[0].name} liked your post`;
  if (actors.length === 2)
    return `${actors[0].name} and ${actors[1].name} liked your post`;
  return `${actors[0].name} and ${actors.length - 1} others liked your post`;
};

const NotificationsList = ({ items }: { items: FeedItem[] }) => {
  const [filter, setFilter] = useState<Filter>("all");
  const [readIds, setReadIds] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  const readSet = useMemo(() => new Set(readIds), [readIds]);

  const isUnread = (item: FeedItem) => {
    const ids = item.kind === "like" ? item.ids : [item.id];
    return item.unread && ids.some((id) => !readSet.has(id));
  };

  const visible = items.filter((item) => {
    if (filter === "likes") return item.kind === "like";
    if (filter === "replies") return item.kind === "reply";
    return true;
  });

  const unreadCount = items.filter(isUnread).length;

  const handleMarkOne = (ids: string[]) => {
    setReadIds((prev) => [...prev, ...ids]);
    startTransition(async () => {
      const result = await markAsReadAction(ids);
      if (!result.ok) {
        setReadIds((prev) => prev.filter((id) => !ids.includes(id)));
        toast.add({
          title: "Could not mark as read",
          description: result.error,
          type: "error",
        });
      }
    });
  };

  const handleMarkAll = () => {
    const allIds = items.flatMap((item) =>
      item.kind === "like" ? item.ids : [item.id],
    );
    setReadIds((prev) => [...new Set([...prev, ...allIds])]);
    startTransition(async () => {
      const result = await markAllAsReadAction();
      if (!result.ok) {
        setReadIds([]);
        toast.add({
          title: "Could not mark all as read",
          description: result.error,
          type: "error",
        });
      }
    });
  };

  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "likes", label: "Likes" },
    { value: "replies", label: "Replies" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}>
            {f.label}
          </Button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="default">{unreadCount} new</Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAll}
            disabled={pending || unreadCount === 0}>
            <CheckCheckIcon
              data-icon="inline-start"
              aria-hidden="true"
            />
            Mark all as read
          </Button>
        </div>
      </div>

      {visible.length === 0 ?
        <Card>
          <CardContent className="py-8 text-center">
            <p className="font-medium">No notifications yet</p>
            <p className="text-muted-foreground text-sm">
              Likes and replies to your posts will show up here.
            </p>
          </CardContent>
        </Card>
      : <Card>
          <CardContent className="flex flex-col gap-0 px-4">
            {visible.map((item, index) => {
              const unread = isUnread(item);
              const ids = item.kind === "like" ? item.ids : [item.id];
              const actor = item.kind === "like" ? item.actors[0] : item.actor;
              const title =
                item.kind === "like" ?
                  likeText(item.actors)
                : `${item.actor.name} replied to your post`;
              return (
                <div key={ids.join("-")}>
                  {index > 0 && <Separator className="my-1" />}
                  <div className="flex items-center gap-3 py-3">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        unread ? "bg-primary" : "bg-transparent",
                      )}
                    />
                    <Avatar size="sm">
                      {actor.image && (
                        <AvatarImage
                          src={actor.image}
                          alt={`${actor.name} avatar`}
                        />
                      )}
                      <AvatarFallback>{getInitials(actor.name)}</AvatarFallback>
                    </Avatar>
                    <Link
                      href={`/post/${item.postId}`}
                      className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="flex min-w-0 flex-1 flex-col leading-tight">
                        <span className="flex items-center gap-1.5 text-sm">
                          {item.kind === "like" ?
                            <HeartIcon
                              data-icon="inline-start"
                              aria-hidden="true"
                            />
                          : <MessageCircleIcon
                              data-icon="inline-start"
                              aria-hidden="true"
                            />
                          }
                          <span className="truncate font-medium">{title}</span>
                        </span>
                        <span className="text-muted-foreground line-clamp-1 text-xs">
                          {item.kind === "like" ?
                            item.postContent
                          : item.replyContent}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          <TimeAgo iso={item.createdAt} />
                        </span>
                      </span>
                      {item.postImageUrl && (
                        <Image
                          src={item.postImageUrl}
                          alt="Post attachment"
                          width={64}
                          height={64}
                          className="size-12 shrink-0 rounded-md object-cover"
                          sizes="48px"
                        />
                      )}
                    </Link>
                    {unread && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleMarkOne(ids)}
                        disabled={pending}
                        aria-label="Mark as read">
                        <CheckIcon aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      }
    </div>
  );
};

export default NotificationsList;

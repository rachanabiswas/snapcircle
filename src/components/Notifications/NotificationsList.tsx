"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckIcon, HeartIcon, MessageCircleIcon } from "lucide-react";

import type { FeedItem } from "@/lib/notificationsGrouping";
import TimeAgo from "@/components/Feed/TimeAgo";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcnui/avatar";
import { Button } from "@/components/shadcnui/button";
import { Card, CardContent } from "@/components/shadcnui/card";
import { cn } from "@/lib/utils";

export type Filter = "all" | "unread" | "likes" | "replies";

export type NotificationsEmptyState = {
  title: string;
  body: string;
};

type DateGroup = {
  key: "today" | "yesterday" | "earlier";
  label: string;
  items: FeedItem[];
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const formatLikeText = (actorNames: string[]) => {
  if (actorNames.length === 1) return `${actorNames[0]} liked your post`;
  if (actorNames.length === 2)
    return `${actorNames[0]} and ${actorNames[1]} liked your post`;
  return `${actorNames[0]} and ${actorNames.length - 1} others liked your post`;
};

const groupByDate = (items: FeedItem[]): DateGroup[] => {
  const startOfToday = (() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  })();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

  const groups: DateGroup[] = [];
  let current: DateGroup | null = null;

  for (const item of items) {
    const time = new Date(item.createdAt).getTime();
    const key =
      time >= startOfToday ? "today"
      : time >= startOfYesterday ? "yesterday"
      : "earlier";
    const label =
      key === "today" ? "Today"
      : key === "yesterday" ? "Yesterday"
      : "Earlier";
    if (!current || current.key !== key) {
      current = { key, label, items: [] };
      groups.push(current);
    }
    current.items.push(item);
  }

  return groups;
};

type NotificationsListProps = {
  items: FeedItem[];
  readSet: Set<string>;
  onMarkRead: (ids: string[]) => void;
  actionDisabled: boolean;
  emptyState: NotificationsEmptyState;
};

const NotificationsList = ({
  items,
  readSet,
  onMarkRead,
  actionDisabled,
  emptyState,
}: NotificationsListProps) => {
  const isUnread = (item: FeedItem) => {
    const ids = item.kind === "like" ? item.ids : [item.id];
    return item.unread && ids.some((id) => !readSet.has(id));
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="font-medium">{emptyState.title}</p>
          <p className="text-muted-foreground text-sm">{emptyState.body}</p>
        </CardContent>
      </Card>
    );
  }

  const groups = groupByDate(items);

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {groups.map((group) => (
        <section
          key={group.key}
          aria-label={group.label}
          className="flex flex-col gap-2">
          <h3
            suppressHydrationWarning
            className="text-muted-foreground px-1 text-xs font-medium tracking-wide uppercase">
            {group.label}
          </h3>
          <div className="flex flex-col gap-2">
            {group.items.map((item) => {
              const unread = isUnread(item);
              const ids = item.kind === "like" ? item.ids : [item.id];
              const actor = item.kind === "like" ? item.actors[0] : item.actor;
              const title =
                item.kind === "like" ?
                  formatLikeText(item.actors.map((a) => a.name))
                : `${item.actor.name} replied to your post`;
              return (
                <Card
                  key={ids.join("-")}
                  className="py-0">
                  <CardContent className="px-4">
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
                        <AvatarFallback>
                          {getInitials(actor.name)}
                        </AvatarFallback>
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
                            <span className="truncate font-medium">
                              {title}
                            </span>
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
                          onClick={() => onMarkRead(ids)}
                          disabled={actionDisabled}
                          aria-label="Mark as read">
                          <CheckIcon aria-hidden="true" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};

export default NotificationsList;

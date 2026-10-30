"use client";

import { CheckCheckIcon } from "lucide-react";

import type { NotificationCounts } from "@/lib/notificationsGrouping";
import { Badge } from "@/components/shadcnui/badge";
import { Button } from "@/components/shadcnui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { cn } from "@/lib/utils";
import type { Filter } from "@/components/Notifications/NotificationsList";

type NotificationsRailProps = {
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
  counts: NotificationCounts;
  unreadCount: number;
  onMarkAll: () => void;
  pending: boolean;
};

const NotificationsRail = ({
  filter,
  onFilterChange,
  counts,
  unreadCount,
  onMarkAll,
  pending,
}: NotificationsRailProps) => {
  const filters: { value: Filter; label: string; count: number }[] = [
    { value: "all", label: "All", count: counts.all },
    { value: "unread", label: "Unread", count: unreadCount },
    { value: "likes", label: "Likes", count: counts.likes },
    { value: "replies", label: "Replies", count: counts.replies },
  ];

  return (
    <div className="flex flex-col gap-3">
      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-base">Activity</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => onFilterChange(f.value)}
              aria-pressed={filter === f.value}
              className={cn(
                "hover:text-foreground hover:bg-accent/50 flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                filter === f.value && "bg-accent text-accent-foreground",
              )}>
              <span>{f.label}</span>
              <Badge variant={filter === f.value ? "default" : "secondary"}>
                {f.count}
              </Badge>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-base">Catch up</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-muted-foreground text-xs">
            {unreadCount > 0 ?
              `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
            : "Everything is read."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onMarkAll}
            disabled={pending || unreadCount === 0}>
            <CheckCheckIcon
              data-icon="inline-start"
              aria-hidden="true"
            />
            Mark all as read
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsRail;

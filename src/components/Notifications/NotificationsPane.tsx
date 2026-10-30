"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { CheckCheckIcon } from "lucide-react";

import useInfiniteCursor from "@/hooks/useInfiniteCursor";
import type { FeedItem, NotificationCounts } from "@/lib/notificationsGrouping";
import NotificationsList, {
  type Filter,
  type NotificationsEmptyState,
} from "@/components/Notifications/NotificationsList";
import NotificationsRail from "@/components/Notifications/NotificationsRail";
import { Badge } from "@/components/shadcnui/badge";
import { Button } from "@/components/shadcnui/button";
import { Spinner } from "@/components/shadcnui/spinner";
import { toast } from "@/components/shadcnui/toast";
import {
  getNotificationsAction,
  markAllAsReadAction,
  markAsReadAction,
} from "@/server/notifications";

type NotificationsPaneProps = {
  initialItems: FeedItem[];
  initialCursor: string | null;
  counts: NotificationCounts;
};

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "likes", label: "Likes" },
  { value: "replies", label: "Replies" },
];

const NotificationsPane = ({
  initialItems,
  initialCursor,
  counts,
}: NotificationsPaneProps) => {
  const router = useRouter();
  const [items, setItems] = useState<FeedItem[]>(initialItems);
  const [filter, setFilter] = useState<Filter>("all");
  const [readIds, setReadIds] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  // Server actions revalidate and send fresh page-1 data; merge it in so new
  // and removed notifications are reflected without losing appended pages.
  // Only items outside the previous page-1 scope are kept from local state,
  // so notifications the fresh page no longer contains are dropped.
  const serverItemsRef = useRef(initialItems);
  useEffect(() => {
    if (initialItems === serverItemsRef.current) return;
    const previousItems = serverItemsRef.current;
    serverItemsRef.current = initialItems;
    const previousKeys = new Set(
      previousItems.map((item) =>
        item.kind === "like" ? item.ids.join("-") : item.id,
      ),
    );
    setItems((prev) =>
      prev === previousItems ? initialItems : (
        [
          ...initialItems,
          ...prev.filter((item) => {
            const key = item.kind === "like" ? item.ids.join("-") : item.id;
            return !previousKeys.has(key);
          }),
        ]
      ),
    );
  }, [initialItems]);

  const { sentinelRef, hasMore, isLoading, error, loadMore } =
    useInfiniteCursor<FeedItem>({
      initialCursor,
      fetchPage: getNotificationsAction,
      onAppend: (newItems) => setItems((prev) => [...prev, ...newItems]),
    });

  const readSet = useMemo(() => new Set(readIds), [readIds]);

  const isUnread = useCallback(
    (item: FeedItem) => {
      const ids = item.kind === "like" ? item.ids : [item.id];
      return item.unread && ids.some((id) => !readSet.has(id));
    },
    [readSet],
  );

  const visible = useMemo(() => {
    if (filter === "likes") return items.filter((item) => item.kind === "like");
    if (filter === "replies")
      return items.filter((item) => item.kind === "reply");
    if (filter === "unread") return items.filter(isUnread);
    return items;
  }, [filter, isUnread, items]);

  const unreadCount = useMemo(
    () => items.filter(isUnread).length,
    [isUnread, items],
  );

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
        return;
      }
      // Keeps the sidebar unread badge and filter counts in sync.
      router.refresh();
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
        return;
      }
      // Keeps the sidebar unread badge and filter counts in sync.
      router.refresh();
    });
  };

  const emptyState: NotificationsEmptyState =
    filter === "unread" ?
      { title: "No unread notifications", body: "You are all caught up." }
    : filter === "likes" ?
      { title: "No likes yet", body: "Likes on your posts will show up here." }
    : filter === "replies" ?
      {
        title: "No replies yet",
        body: "Replies to your posts will show up here.",
      }
    : {
        title: "No notifications yet",
        body: "Likes and replies to your posts will show up here.",
      };

  return (
    <div className="flex flex-col gap-3">
      {/* Compact filter row for one-column layouts */}
      <div className="flex flex-wrap items-center gap-2 lg:hidden">
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
            Mark all
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[minmax(200px,220px)_minmax(0,1fr)]">
        <aside className="hidden flex-col gap-3 lg:sticky lg:top-16 lg:flex">
          <NotificationsRail
            filter={filter}
            onFilterChange={setFilter}
            counts={counts}
            unreadCount={unreadCount}
            onMarkAll={handleMarkAll}
            pending={pending}
          />
        </aside>

        <div className="flex min-w-0 flex-col gap-3">
          <NotificationsList
            items={visible}
            readSet={readSet}
            onMarkRead={handleMarkOne}
            actionDisabled={pending}
            emptyState={emptyState}
          />

          <div
            ref={sentinelRef}
            aria-hidden="true"
            className="h-px"
          />

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
                Loading more notifications
              </span>
            )}
            {!isLoading && !error && !hasMore && (
              <p className="text-muted-foreground text-sm">
                You&apos;re all caught up
              </p>
            )}
            {!isLoading && !error && hasMore && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadMore()}>
                Load more
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPane;

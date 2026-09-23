"use client";

import { useSyncExternalStore } from "react";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  format,
} from "date-fns";
import { enUS } from "date-fns/locale";

const formatFeedTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const diffMin = differenceInMinutes(now, date);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = differenceInHours(now, date);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = differenceInDays(now, date);
  if (diffDays < 7) return `${diffDays}d ago`;
  return format(date, "MMM d, yyyy", { locale: enUS });
};

const subscribe = (notify: () => void) => {
  const id = setInterval(notify, 60000);
  return () => clearInterval(id);
};

const TimeAgo = ({ iso }: { iso: string }) => {
  const text = useSyncExternalStore(
    subscribe,
    () => formatFeedTime(iso),
    () => "",
  );
  if (text === "") return null;
  return <>{text}</>;
};

export default TimeAgo;

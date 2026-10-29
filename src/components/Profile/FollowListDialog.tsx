"use client";

import Link from "next/link";

import FollowButton from "@/components/Profile/FollowButton";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcnui/avatar";
import { Button } from "@/components/shadcnui/button";
import { Card } from "@/components/shadcnui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcnui/dialog";

export type FollowListUser = {
  id: string;
  name: string;
  image: string | null;
  bio: string | null;
  viewerFollowing: boolean;
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

const DESCRIPTIONS: Record<"Followers" | "Following", string> = {
  Followers: "People who follow this account.",
  Following: "People this account follows.",
};

const FollowListDialog = ({
  title,
  count,
  users,
  viewerId,
  emptyMessage,
}: {
  title: "Followers" | "Following";
  count: number;
  users: FollowListUser[];
  viewerId: string;
  emptyMessage: string;
}) => {
  return (
    <Dialog>
      <Card className="hover:bg-muted/40 transition-colors">
        <DialogTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              className="h-auto w-full flex-col items-start gap-1 rounded-xl text-left font-normal hover:bg-transparent"
              aria-label={`View ${count} ${title.toLowerCase()}`}
            />
          }>
          <span className="font-heading text-2xl font-semibold tabular-nums">
            {count}
          </span>
          <span className="text-muted-foreground text-sm">{title}</span>
        </DialogTrigger>
      </Card>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{DESCRIPTIONS[title]}</DialogDescription>
        </DialogHeader>

        {users.length === 0 ?
          <p className="text-muted-foreground py-6 text-center text-sm">
            {emptyMessage}
          </p>
        : <ul className="flex max-h-[60vh] flex-col gap-1 overflow-y-auto pr-1">
            {users.map((member) => (
              <li
                key={member.id}
                className="flex items-center gap-3 rounded-lg px-1 py-2">
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
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex min-w-0 flex-1 flex-col leading-tight">
                  <Link
                    href={`/profile/${member.id}`}
                    className="truncate text-sm font-medium hover:underline">
                    {member.name}
                  </Link>
                  <span className="text-muted-foreground truncate text-xs">
                    {member.bio?.trim() || "No bio yet"}
                  </span>
                </div>
                {member.id !== viewerId && (
                  <FollowButton
                    targetId={member.id}
                    initialFollowing={member.viewerFollowing}
                    size="xs"
                  />
                )}
              </li>
            ))}
          </ul>
        }

        {users.length > 0 && users.length < count && (
          <p className="text-muted-foreground text-xs">
            Showing the {users.length} most recent.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FollowListDialog;

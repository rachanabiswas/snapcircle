"use client";

import { useState } from "react";
import { UserCheckIcon, UserPlusIcon } from "lucide-react";

import { Button } from "@/components/shadcnui/button";
import { toast } from "@/components/shadcnui/toast";
import { followUserAction, unfollowUserAction } from "@/server/follows";

const FollowButton = ({
  targetId,
  initialFollowing,
  size = "sm",
}: {
  targetId: string;
  initialFollowing: boolean;
  size?: "xs" | "sm" | "default";
}) => {
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    if (isPending) return;
    setIsPending(true);

    const result =
      following ?
        await unfollowUserAction(targetId)
      : await followUserAction(targetId);

    setIsPending(false);

    if (!result.ok) {
      toast.add({
        title: "Could not update follow",
        description: result.error,
        type: "error",
      });
      return;
    }

    setFollowing((prev) => !prev);
  };

  return (
    <Button
      type="button"
      variant={following ? "outline" : "default"}
      size={size}
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={following}>
      {following ?
        <UserCheckIcon
          data-icon="inline-start"
          aria-hidden="true"
        />
      : <UserPlusIcon
          data-icon="inline-start"
          aria-hidden="true"
        />
      }
      {following ? "Following" : "Follow"}
    </Button>
  );
};

export default FollowButton;

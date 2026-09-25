"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2Icon, LogOutIcon, UserIcon } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcnui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcnui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/components/shadcnui/toast";

export type HeaderUser = {
  name: string | null;
  email: string | null;
  image?: string | null;
  role?: string | null;
} | null;

const getInitials = (name: string | null, email: string | null) => {
  if (name) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return email?.slice(0, 2).toUpperCase() ?? "U";
};

const UserMenu = ({ user }: { user: HeaderUser }) => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleSignOut = async () => {
    setIsPending(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.add({
            title: "Signed out",
            description: "See you soon!",
            type: "success",
          });
          router.push("/");
        },
        onError: (ctx) => {
          toast.add({
            title: "Sign out failed",
            description: ctx.error.message,
            type: "error",
          });
        },
      },
    });
    setIsPending(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="focus-visible:ring-ring cursor-pointer rounded-full outline-none focus-visible:ring-2"
        aria-label="Open user menu">
        <Avatar>
          {user?.image && (
            <AvatarImage
              src={user.image}
              alt={user.name ?? "User avatar"}
            />
          )}
          <AvatarFallback>
            {getInitials(user?.name ?? null, user?.email ?? null)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="flex min-w-0 items-center gap-3">
              <Avatar size="lg">
                {user?.image && (
                  <AvatarImage
                    src={user.image}
                    alt={user.name ?? "User avatar"}
                  />
                )}
                <AvatarFallback>
                  {getInitials(user?.name ?? null, user?.email ?? null)}
                </AvatarFallback>
              </Avatar>
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium">
                  {user?.name ?? "Account"}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {user?.email ?? ""}
                </span>
              </span>
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/profile" />}>
            <UserIcon
              data-icon="inline-start"
              aria-hidden="true"
            />
            Profile
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={handleSignOut}
            disabled={isPending}>
            {isPending ?
              <Loader2Icon
                className="animate-spin"
                aria-hidden="true"
              />
            : <LogOutIcon
                data-icon="inline-start"
                aria-hidden="true"
              />
            }
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;

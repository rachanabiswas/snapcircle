"use client";

import Link from "next/link";
import { useState } from "react";
import { MenuIcon, SettingsIcon, UserIcon } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcnui/avatar";
import { Button } from "@/components/shadcnui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/shadcnui/sheet";
import { Separator } from "@/components/shadcnui/separator";
import ThemeToggleButton from "./ThemeToggleButton";

type UserDrawerProps = {
  user: {
    name: string | null;
    email: string | null;
    image?: string | null;
  } | null;
};

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

const UserDrawer = ({ user }: UserDrawerProps) => {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
          />
        }>
        <MenuIcon aria-hidden="true" />
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-80">
        <SheetHeader>
          <SheetTitle className="sr-only">User menu</SheetTitle>
        </SheetHeader>

        {user ?
          <div className="flex items-center gap-3 px-4">
            <Avatar size="lg">
              {user.image && (
                <AvatarImage
                  src={user.image}
                  alt={user.name ?? "User avatar"}
                />
              )}
              <AvatarFallback>
                {getInitials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-medium">{user.name}</span>
              <span className="text-muted-foreground truncate text-sm">
                {user.email}
              </span>
            </div>
          </div>
        : <div className="px-4">
            <Button
              render={<Link href="/" />}
              nativeButton={false}
              className="w-full">
              Sign in
            </Button>
          </div>
        }

        <Separator />

        <nav
          className="flex flex-col gap-1 px-2"
          aria-label="User menu">
          <Button
            variant="ghost"
            render={<Link href="/profile" />}
            nativeButton={false}
            onClick={close}>
            <UserIcon
              data-icon="inline-start"
              aria-hidden="true"
            />
            Profile
          </Button>
          <Button
            variant="ghost"
            render={<Link href="/settings" />}
            nativeButton={false}
            onClick={close}>
            <SettingsIcon
              data-icon="inline-start"
              aria-hidden="true"
            />
            Settings
          </Button>
        </nav>

        <SheetFooter>
          <div className="flex items-center justify-between px-4">
            <span className="text-muted-foreground text-sm">Theme</span>
            <ThemeToggleButton />
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default UserDrawer;

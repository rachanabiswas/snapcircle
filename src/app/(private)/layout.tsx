import Link from "next/link";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { BellIcon } from "lucide-react";

import AppSidebar from "@/components/Layout/AppSidebar";
import UserMenu from "@/components/Layout/UserMenu";
import { Badge } from "@/components/shadcnui/badge";
import { buttonVariants } from "@/components/shadcnui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/shadcnui/sidebar";
import { auth } from "@/lib/auth";
import prisma from "@/lib/dbClient/prisma";
import { LayoutProps } from "@/lib/types";

const PrivateLayout = async ({ children }: LayoutProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  const user = session.user;

  const unreadCount = await prisma.notification.count({
    where: { recipientId: user.id, readAt: null },
  });

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar
        user={{
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role ?? null,
        }}
        unreadCount={unreadCount}
      />
      <SidebarInset>
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <SidebarTrigger aria-label="Toggle sidebar" />
          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/notifications"
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
              aria-label={
                unreadCount > 0 ?
                  `Notifications, ${unreadCount} unread`
                : "Notifications"
              }>
              <span className="relative">
                <BellIcon aria-hidden="true" />
                {unreadCount > 0 && (
                  <Badge
                    variant="default"
                    className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 text-[10px]">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </span>
            </Link>
            <UserMenu
              user={{
                name: user.name,
                email: user.email,
                image: user.image,
                role: user.role ?? null,
              }}
            />
          </div>
        </div>
        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default PrivateLayout;

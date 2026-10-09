"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { BellIcon } from "lucide-react";

import ThemeToggleButton from "@/components/Layout/ThemeToggleButton";
import UserMenu, { type HeaderUser } from "@/components/Layout/UserMenu";
import { Badge } from "@/components/shadcnui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/shadcnui/breadcrumb";
import { buttonVariants } from "@/components/shadcnui/button";
import { SidebarTrigger } from "@/components/shadcnui/sidebar";
import { getHeaderTitle } from "@/lib/pageTitles";

const AppHeader = ({
  user,
  unreadCount = 0,
}: {
  user: HeaderUser;
  unreadCount?: number;
}) => {
  const pathname = usePathname();
  const { crumbs } = getHeaderTitle(pathname ?? "/feed");

  return (
    <header className="flex h-16 items-center gap-2 border-b px-4">
      <SidebarTrigger aria-label="Toggle sidebar" />
      <Breadcrumb className="min-w-0">
        <BreadcrumbList className="flex-nowrap gap-1.5 overflow-hidden text-sm">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            return (
              <Fragment key={`${crumb.label}-${index}`}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem className="min-w-0 shrink-0 last:min-w-0 last:shrink">
                  {crumb.href && !isLast ?
                    <BreadcrumbLink
                      render={<Link href={crumb.href as Route} />}>
                      {crumb.label}
                    </BreadcrumbLink>
                  : <h1
                      aria-current="page"
                      className="text-foreground truncate text-sm font-semibold">
                      {crumb.label}
                    </h1>
                  }
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggleButton />
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
        <UserMenu user={user} />
      </div>
    </header>
  );
};

export default AppHeader;

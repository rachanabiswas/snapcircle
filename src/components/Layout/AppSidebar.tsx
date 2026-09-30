"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellIcon,
  LayoutDashboardIcon,
  NewspaperIcon,
  SettingsIcon,
  ShieldIcon,
  UserIcon,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/shadcnui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/shadcnui/sidebar";
import { TooltipProvider } from "@/components/shadcnui/tooltip";

export type SidebarUser = {
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
} | null;

const AppSidebar = ({
  user,
  unreadCount = 0,
}: {
  user: SidebarUser;
  unreadCount?: number;
}) => {
  const pathname = usePathname();

  const isAdmin = user?.role === "admin";

  type NavHref =
    | "/dashboard"
    | "/feed"
    | "/profile"
    | "/notifications"
    | "/settings"
    | "/admin";
  const navItems: { href: NavHref; label: string; icon: LucideIcon }[] = [
    { href: "/feed", label: "Feed", icon: NewspaperIcon },
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboardIcon,
    },
    { href: "/profile", label: "Profile", icon: UserIcon },
    {
      href: "/notifications",
      label: "Notifications",
      icon: BellIcon,
    },
    { href: "/settings", label: "Settings", icon: SettingsIcon },
    ...(isAdmin ?
      [{ href: "/admin" as NavHref, label: "Admin", icon: ShieldIcon }]
    : []),
  ];

  return (
    <TooltipProvider delay={0}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                tooltip="SnapCircle"
                render={<Link href="/feed" />}>
                <span
                  className="bg-primary text-primary-foreground font-heading flex size-8 shrink-0 items-center justify-center rounded-md text-sm font-semibold"
                  aria-hidden="true">
                  S
                </span>
                <span className="flex flex-col text-left leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="font-heading truncate text-sm font-medium">
                    SnapCircle
                  </span>
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={
                        item.href === "/notifications" && unreadCount > 0 ?
                          `Notifications, ${unreadCount} unread`
                        : item.label
                      }
                      render={<Link href={item.href} />}>
                      <item.icon
                        data-icon="inline-start"
                        aria-hidden="true"
                      />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {item.label}
                      </span>
                      {item.href === "/notifications" && unreadCount > 0 && (
                        <Badge
                          variant="default"
                          className="ml-auto group-data-[collapsible=icon]:hidden">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                    {item.href === "/notifications" && unreadCount > 0 && (
                      <span
                        aria-hidden="true"
                        className="bg-primary absolute top-1.5 right-1.5 hidden size-1.5 rounded-full group-data-[collapsible=icon]:block"
                      />
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </TooltipProvider>
  );
};

export default AppSidebar;

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

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcnui/avatar";
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
                <Avatar size="sm">
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
                <span className="flex flex-col text-left leading-tight">
                  <span className="text-muted-foreground truncate text-xs">
                    {user?.email ?? "Welcome"}
                  </span>
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarSeparator />

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
                      <span>{item.label}</span>
                      {item.href === "/notifications" && unreadCount > 0 && (
                        <Badge
                          variant="default"
                          className="ml-auto">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                      )}
                    </SidebarMenuButton>
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

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import AppSidebar from "@/components/Layout/AppSidebar";
import SignOutButton from "@/components/Auth/SignOutButton";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/shadcnui/sidebar";
import { Separator } from "@/components/shadcnui/separator";
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
        <div className="flex items-center gap-2 border-b px-4 py-2">
          <SidebarTrigger aria-label="Toggle sidebar" />
          <Separator
            orientation="vertical"
            className="h-4"
          />
          <span className="font-heading text-sm font-medium">SnapCircle</span>
          <div className="ml-auto">
            <SignOutButton />
          </div>
        </div>
        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default PrivateLayout;

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import AppHeader from "@/components/Layout/AppHeader";
import AppSidebar from "@/components/Layout/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/shadcnui/sidebar";
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
      <SidebarInset className="bg-transparent">
        <AppHeader
          user={{
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role ?? null,
          }}
          unreadCount={unreadCount}
        />
        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default PrivateLayout;

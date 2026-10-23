import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import NotificationPrefsForm from "@/components/Settings/NotificationPrefsForm";
import SettingsPanel from "@/components/Settings/SettingsPanel";
import { auth } from "@/lib/auth";
import prisma from "@/lib/dbClient/prisma";
import { SETTINGS_SECTIONS } from "@/lib/settings";

export const metadata: Metadata = {
  title: SETTINGS_SECTIONS.notifications.label,
  description: SETTINGS_SECTIONS.notifications.description,
};

const NotificationsSettingsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <SettingsPanel section="notifications">
      <NotificationPrefsForm
        initial={{
          likeNotifications: prefs?.likeNotifications ?? true,
          replyNotifications: prefs?.replyNotifications ?? true,
          pauseAll: prefs?.pauseAll ?? false,
        }}
      />
    </SettingsPanel>
  );
};

export default NotificationsSettingsPage;

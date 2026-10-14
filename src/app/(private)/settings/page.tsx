import { headers } from "next/headers";
import type { Metadata } from "next";

import SettingsSteps from "@/components/Settings/SettingsSteps";
import { auth } from "@/lib/auth";
import prisma from "@/lib/dbClient/prisma";
import { genderOptions, type Gender } from "@/lib/zodSchema";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your SnapCircle settings",
};

const toGender = (value: string | null): Gender =>
  genderOptions.includes(value as Gender) ?
    (value as Gender)
  : "prefer_not_to_say";

const SettingsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-muted-foreground">
          Please sign in to manage settings.
        </p>
      </main>
    );
  }

  const [user, prefs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, bio: true, gender: true },
    }),
    prisma.notificationPreference.findUnique({
      where: { userId: session.user.id },
    }),
  ]);

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-muted-foreground">Account not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-8">
      <SettingsSteps
        user={{
          name: user.name,
          email: user.email,
          bio: user.bio ?? "",
          gender: toGender(user.gender),
        }}
        prefs={{
          likeNotifications: prefs?.likeNotifications ?? true,
          replyNotifications: prefs?.replyNotifications ?? true,
          pauseAll: prefs?.pauseAll ?? false,
        }}
      />
    </main>
  );
};

export default SettingsPage;

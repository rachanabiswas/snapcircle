import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

import SettingsPanel from "@/components/Settings/SettingsPanel";
import SettingsProfileForm from "@/components/Settings/SettingsProfileForm";
import { auth } from "@/lib/auth";
import prisma from "@/lib/dbClient/prisma";
import { SETTINGS_SECTIONS } from "@/lib/settings";
import { genderOptions, type Gender } from "@/lib/zodSchema";

export const metadata: Metadata = {
  title: SETTINGS_SECTIONS.profile.label,
  description: SETTINGS_SECTIONS.profile.description,
};

const toGender = (value: string | null): Gender =>
  genderOptions.includes(value as Gender) ?
    (value as Gender)
  : "prefer_not_to_say";

const ProfileSettingsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, bio: true, gender: true },
  });

  if (!user) {
    notFound();
  }

  return (
    <SettingsPanel section="profile">
      <SettingsProfileForm
        initialName={user.name}
        initialBio={user.bio ?? ""}
        initialGender={toGender(user.gender)}
      />
    </SettingsPanel>
  );
};

export default ProfileSettingsPage;

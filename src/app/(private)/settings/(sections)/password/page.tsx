import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

import ChangePasswordForm from "@/components/Settings/ChangePasswordForm";
import SettingsPanel from "@/components/Settings/SettingsPanel";
import { auth } from "@/lib/auth";
import prisma from "@/lib/dbClient/prisma";
import { SETTINGS_SECTIONS } from "@/lib/settings";

export const metadata: Metadata = {
  title: SETTINGS_SECTIONS.password.label,
  description: SETTINGS_SECTIONS.password.description,
};

const PasswordSettingsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });

  if (!user) {
    notFound();
  }

  return (
    <SettingsPanel section="password">
      <ChangePasswordForm currentEmail={user.email} />
    </SettingsPanel>
  );
};

export default PasswordSettingsPage;

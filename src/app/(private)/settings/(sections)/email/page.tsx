import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

import ChangeEmailForm from "@/components/Settings/ChangeEmailForm";
import SettingsPanel from "@/components/Settings/SettingsPanel";
import { auth } from "@/lib/auth";
import prisma from "@/lib/dbClient/prisma";
import { SETTINGS_SECTIONS } from "@/lib/settings";

export const metadata: Metadata = {
  title: SETTINGS_SECTIONS.email.label,
  description: SETTINGS_SECTIONS.email.description,
};

const EmailSettingsPage = async () => {
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
    <SettingsPanel section="email">
      <ChangeEmailForm currentEmail={user.email} />
    </SettingsPanel>
  );
};

export default EmailSettingsPage;

import type { Metadata } from "next";

import DeleteAccountForm from "@/components/Settings/DeleteAccountForm";
import SettingsPanel from "@/components/Settings/SettingsPanel";
import { SETTINGS_SECTIONS } from "@/lib/settings";

export const metadata: Metadata = {
  title: SETTINGS_SECTIONS.danger.label,
  description: SETTINGS_SECTIONS.danger.description,
};

const DangerSettingsPage = () => {
  return (
    <SettingsPanel section="danger">
      <div className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm">
          Deleting your account removes your profile, posts, likes, and
          notifications permanently. This cannot be undone.
        </p>
        <div>
          <DeleteAccountForm />
        </div>
      </div>
    </SettingsPanel>
  );
};

export default DangerSettingsPage;

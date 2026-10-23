import type { Metadata } from "next";

import SettingsHub from "@/components/Settings/SettingsHub";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your SnapCircle settings",
};

const SettingsPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-heading text-lg font-semibold">All settings</h2>
        <p className="text-muted-foreground text-sm">
          Manage your account, preferences, and data.
        </p>
      </div>
      <SettingsHub />
    </div>
  );
};

export default SettingsPage;

import type { Metadata } from "next";

import DataExportButton from "@/components/Settings/DataExportButton";
import SettingsPanel from "@/components/Settings/SettingsPanel";
import { SETTINGS_SECTIONS } from "@/lib/settings";

export const metadata: Metadata = {
  title: SETTINGS_SECTIONS.data.label,
  description: SETTINGS_SECTIONS.data.description,
};

const DataSettingsPage = () => {
  return (
    <SettingsPanel section="data">
      <div className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm">
          Your export includes your profile, posts, likes, notifications,
          sessions, and notification preferences.
        </p>
        <div>
          <DataExportButton />
        </div>
      </div>
    </SettingsPanel>
  );
};

export default DataSettingsPage;

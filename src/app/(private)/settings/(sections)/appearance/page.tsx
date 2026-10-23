import type { Metadata } from "next";

import AppearanceSettings from "@/components/Settings/AppearanceSettings";
import SettingsPanel from "@/components/Settings/SettingsPanel";
import { SETTINGS_SECTIONS } from "@/lib/settings";

export const metadata: Metadata = {
  title: SETTINGS_SECTIONS.appearance.label,
  description: SETTINGS_SECTIONS.appearance.description,
};

const AppearanceSettingsPage = () => {
  return (
    <SettingsPanel section="appearance">
      <AppearanceSettings />
    </SettingsPanel>
  );
};

export default AppearanceSettingsPage;

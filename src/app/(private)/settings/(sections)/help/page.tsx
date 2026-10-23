import type { Metadata } from "next";

import HelpSection from "@/components/Settings/HelpSection";
import SettingsPanel from "@/components/Settings/SettingsPanel";
import { SETTINGS_SECTIONS } from "@/lib/settings";

export const metadata: Metadata = {
  title: SETTINGS_SECTIONS.help.label,
  description: SETTINGS_SECTIONS.help.description,
};

const HelpSettingsPage = () => {
  return (
    <SettingsPanel section="help">
      <HelpSection />
    </SettingsPanel>
  );
};

export default HelpSettingsPage;

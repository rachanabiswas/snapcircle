import SettingsNav from "@/components/Settings/SettingsNav";
import { LayoutProps } from "@/lib/types";

const SettingsSectionsLayout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col gap-6">
      <SettingsNav />
      <div className="min-w-0">{children}</div>
    </div>
  );
};

export default SettingsSectionsLayout;

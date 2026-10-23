import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/shadcnui/card";
import { SETTINGS_SECTIONS, type SettingsSectionKey } from "@/lib/settings";
import { cn } from "@/lib/utils";

type SettingsPanelProps = {
  section: SettingsSectionKey;
  children: ReactNode;
};

const SettingsPanel = ({ section, children }: SettingsPanelProps) => {
  const { label, description } = SETTINGS_SECTIONS[section];
  const isDanger = section === "danger";

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2
          className={cn(
            "font-heading text-lg font-semibold",
            isDanger && "text-destructive",
          )}>
          {label}
        </h2>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <Card className={cn(isDanger && "ring-destructive/40")}>
        <CardContent>{children}</CardContent>
      </Card>
    </section>
  );
};

export default SettingsPanel;

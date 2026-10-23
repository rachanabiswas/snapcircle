import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

import { SETTINGS_ICONS } from "@/components/Settings/settingsIcons";
import { Card, CardContent } from "@/components/shadcnui/card";
import { SETTINGS_SECTION_LIST } from "@/lib/settings";
import { cn } from "@/lib/utils";

const SettingsHub = () => {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {SETTINGS_SECTION_LIST.map((section) => {
        const Icon = SETTINGS_ICONS[section.href];
        const isDanger = section.href === "/settings/danger";

        return (
          <li key={section.href}>
            <Link
              href={section.href}
              className="group focus-visible:ring-ring block rounded-xl outline-none focus-visible:ring-2">
              <Card
                className={cn(
                  "group-hover:bg-accent/50 h-full transition-colors",
                  isDanger && "ring-destructive/40",
                )}>
                <CardContent className="flex flex-row items-start gap-3">
                  <span
                    className={cn(
                      "bg-muted text-muted-foreground group-hover:bg-background flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                      isDanger && "bg-destructive/10 text-destructive",
                    )}>
                    <Icon
                      className="size-4"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span
                      className={cn(
                        "font-heading text-base font-medium",
                        isDanger && "text-destructive",
                      )}>
                      {section.label}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {section.description}
                    </span>
                  </span>
                  <ChevronRightIcon
                    className="text-muted-foreground mt-1 size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </CardContent>
              </Card>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default SettingsHub;

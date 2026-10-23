"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SETTINGS_ICONS } from "@/components/Settings/settingsIcons";
import { SETTINGS_SECTION_LIST } from "@/lib/settings";
import { cn } from "@/lib/utils";

const SettingsNav = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Settings"
      className="min-w-0">
      <ul className="-mx-4 flex [scrollbar-width:none] gap-1 overflow-x-auto px-4 pb-1 [&::-webkit-scrollbar]:hidden">
        {SETTINGS_SECTION_LIST.map((section) => {
          const Icon = SETTINGS_ICONS[section.href];
          const isActive = pathname === section.href;
          const isDanger = section.href === "/settings/danger";

          return (
            <li
              key={section.href}
              className="shrink-0">
              <Link
                href={section.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "focus-visible:ring-ring flex items-center gap-2 rounded-md px-3 py-2 text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-2",
                  isActive ?
                    "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  isDanger &&
                    (isActive ?
                      "bg-destructive/10 text-destructive"
                    : "text-destructive hover:bg-destructive/10 hover:text-destructive"),
                )}>
                <Icon
                  data-icon="inline-start"
                  className="size-4"
                  aria-hidden="true"
                />
                {section.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default SettingsNav;

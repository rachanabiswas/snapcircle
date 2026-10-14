"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { MonitorIcon, MoonStarIcon, SunIcon } from "lucide-react";

import { Button } from "@/components/shadcnui/button";
import { cn } from "@/lib/utils";

const options = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonStarIcon },
  { value: "system", label: "System", icon: MonitorIcon },
] as const;

const AppearanceSettings = () => {
  const { theme, setTheme } = useTheme();
  // next-themes resolves `theme` only on the client (undefined during SSR).
  // Gate on mount so the server and first client render match, avoiding a
  // hydration mismatch on the button className.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const activeTheme = mounted ? theme : undefined;

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <Button
          key={opt.value}
          type="button"
          variant={activeTheme === opt.value ? "default" : "outline"}
          size="sm"
          onClick={() => setTheme(opt.value)}
          className={cn("cursor-pointer")}>
          <opt.icon
            data-icon="inline-start"
            aria-hidden="true"
          />
          {opt.label}
        </Button>
      ))}
    </div>
  );
};

export default AppearanceSettings;

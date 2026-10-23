import {
  BellIcon,
  CircleHelpIcon,
  DatabaseIcon,
  KeyRoundIcon,
  MailIcon,
  PaletteIcon,
  TriangleAlertIcon,
  UserIcon,
  type LucideIcon,
} from "lucide-react";

import type { SettingsHref } from "@/lib/settings";

export const SETTINGS_ICONS: Record<SettingsHref, LucideIcon> = {
  "/settings/profile": UserIcon,
  "/settings/email": MailIcon,
  "/settings/password": KeyRoundIcon,
  "/settings/notifications": BellIcon,
  "/settings/appearance": PaletteIcon,
  "/settings/data": DatabaseIcon,
  "/settings/danger": TriangleAlertIcon,
  "/settings/help": CircleHelpIcon,
};

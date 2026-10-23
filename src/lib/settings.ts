export const SETTINGS_SECTIONS = {
  profile: {
    href: "/settings/profile",
    label: "Profile",
    description: "Edit your name, bio, and gender.",
  },
  email: {
    href: "/settings/email",
    label: "Email",
    description: "Change the email address on your account.",
  },
  password: {
    href: "/settings/password",
    label: "Password",
    description: "Changing your password signs out other devices.",
  },
  notifications: {
    href: "/settings/notifications",
    label: "Notifications",
    description: "Control in-app like and reply alerts.",
  },
  appearance: {
    href: "/settings/appearance",
    label: "Appearance",
    description: "Choose light, dark, or follow your system.",
  },
  data: {
    href: "/settings/data",
    label: "Your data",
    description: "Download posts, likes, and notifications as JSON.",
  },
  danger: {
    href: "/settings/danger",
    label: "Danger zone",
    description: "Permanently delete your account and all posts.",
  },
  help: {
    href: "/settings/help",
    label: "Help & support",
    description: "Resources, terms, privacy, and app information.",
  },
} as const;

export type SettingsSectionKey = keyof typeof SETTINGS_SECTIONS;

export type SettingsHref =
  (typeof SETTINGS_SECTIONS)[SettingsSectionKey]["href"];

export const SETTINGS_SECTION_LIST = Object.values(SETTINGS_SECTIONS);

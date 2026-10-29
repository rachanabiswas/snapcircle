import { SETTINGS_SECTION_LIST } from "@/lib/settings";

export type HeaderCrumb = {
  label: string;
  href?: string;
};

export type HeaderTitle = {
  title: string;
  crumbs: HeaderCrumb[];
};

const TITLES: Record<string, HeaderTitle> = {
  "/feed": { title: "Feed", crumbs: [{ label: "Feed" }] },
  "/profile": { title: "Profile", crumbs: [{ label: "Profile" }] },
  "/notifications": {
    title: "Notifications",
    crumbs: [{ label: "Notifications" }],
  },
  "/settings": { title: "Settings", crumbs: [{ label: "Settings" }] },
  "/admin": { title: "Admin", crumbs: [{ label: "Admin" }] },
};

const capitalize = (segment: string) =>
  segment.charAt(0).toUpperCase() + segment.slice(1);

export const getHeaderTitle = (pathname: string): HeaderTitle => {
  const exact = TITLES[pathname];
  if (exact) return exact;

  if (pathname.startsWith("/settings/")) {
    const section = SETTINGS_SECTION_LIST.find(
      (item) => item.href === pathname,
    );
    if (section) {
      return {
        title: section.label,
        crumbs: [
          { label: "Settings", href: "/settings" },
          { label: section.label },
        ],
      };
    }
  }

  // Dynamic post detail pages use a generic title with a back link to Feed.
  if (pathname === "/post" || pathname.startsWith("/post/")) {
    return {
      title: "Post",
      crumbs: [{ label: "Feed", href: "/feed" }, { label: "Post" }],
    };
  }

  // Other people's profiles share the same title as your own profile.
  if (pathname.startsWith("/profile/")) {
    return {
      title: "Profile",
      crumbs: [{ label: "Profile" }],
    };
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return { title: "SnapCircle", crumbs: [{ label: "SnapCircle" }] };
  }

  const crumbs: HeaderCrumb[] = segments.map((segment, index) => {
    const label = capitalize(segment);
    const isLast = index === segments.length - 1;
    return isLast ?
        { label }
      : { label, href: `/${segments.slice(0, index + 1).join("/")}` };
  });

  return {
    title: crumbs[crumbs.length - 1].label,
    crumbs,
  };
};

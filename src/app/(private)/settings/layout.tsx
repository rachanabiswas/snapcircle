import type { Metadata } from "next";

import PageContainer from "@/components/Layout/PageContainer";
import { LayoutProps } from "@/lib/types";

export const metadata: Metadata = {
  title: {
    default: "Settings",
    template: "%s | Settings",
  },
  description: "Manage your SnapCircle settings",
};

const SettingsLayout = ({ children }: LayoutProps) => {
  return (
    <PageContainer className="flex max-w-7xl flex-col gap-6">
      {children}
    </PageContainer>
  );
};

export default SettingsLayout;

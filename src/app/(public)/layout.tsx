import { LayoutProps } from "@/lib/types";

const PublicLayout = ({ children }: LayoutProps) => {
  return <main data-backdrop="rich">{children}</main>;
};

export default PublicLayout;

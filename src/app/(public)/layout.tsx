import Header from "@/components/Layout/Header";
import { LayoutProps } from "@/lib/types";

const PublicLayout = ({ children }: LayoutProps) => {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
};

export default PublicLayout;

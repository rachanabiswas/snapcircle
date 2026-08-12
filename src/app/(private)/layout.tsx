import { headers } from "next/headers";
import { redirect } from "next/navigation";

import Header from "@/components/Layout/Header";
import { auth } from "@/lib/auth";
import { LayoutProps } from "@/lib/types";

const PrivateLayout = async ({ children }: LayoutProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
};

export default PrivateLayout;

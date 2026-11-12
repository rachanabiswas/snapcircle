import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import SplashScreen from "@/components/Auth/SplashScreen";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "SnapCircle",
  description: "Loading SnapCircle",
};

const SplashPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/feed");
  }

  return <SplashScreen />;
};

export default SplashPage;

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import LoginForm from "@/components/Auth/LoginForm";
import ThemeToggleButton from "@/components/Layout/ThemeToggleButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your SnapCircle account",
};

const LoginPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/feed");
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-7xl flex-col px-6 py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image
            src="/brand/snapcircle-mark.png"
            alt=""
            width={36}
            height={36}
            preload
            className="ring-foreground/10 size-9 rounded-full ring-1"
          />
          <h1 className="font-heading text-xl font-semibold">SnapCircle</h1>
        </div>
        <ThemeToggleButton />
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md">
          <Card className="bg-card/85 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Welcome back</CardTitle>
              <CardDescription>
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
              <p className="text-muted-foreground mt-6 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-primary font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

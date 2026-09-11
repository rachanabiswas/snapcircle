import Link from "next/link";
import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import AuthCardHeader from "@/components/Auth/AuthCardHeader";
import { auth } from "@/lib/auth";
import RegisterForm from "@/components/Auth/RegisterForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your SnapCircle account",
};

const page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <>
      <main className="grid min-h-dvh place-items-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <AuthCardHeader />
            <CardTitle>Create an account</CardTitle>
            <CardDescription>Join SnapCircle to get started</CardDescription>
          </CardHeader>

          <CardContent>
            <RegisterForm />
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-muted-foreground text-sm">
              Already have an account?{" "}
              <Link
                href="/"
                className="text-primary underline-offset-4 hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </>
  );
};

export default page;

import { headers } from "next/headers";
import Link from "next/link";
import { SettingsIcon, ShieldIcon, UserIcon } from "lucide-react";

import { auth } from "@/lib/auth";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";

const DashboardPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;
  const isAdmin = user?.role === "admin";

  return (
    <div className="mx-auto mt-14 max-w-5xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{user?.name ? `, ${user.name}` : ""}!
          {user?.email ? ` — ${user.email}` : ""}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/profile">
          <Card className="hover:bg-muted/50 h-full transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon
                  className="size-4"
                  aria-hidden="true"
                />
                Profile
              </CardTitle>
              <CardDescription>View and manage your profile</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/settings">
          <Card className="hover:bg-muted/50 h-full transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon
                  className="size-4"
                  aria-hidden="true"
                />
                Settings
              </CardTitle>
              <CardDescription>Adjust your preferences</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        {isAdmin && (
          <Link href="/admin">
            <Card className="hover:bg-muted/50 h-full transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldIcon
                    className="size-4"
                    aria-hidden="true"
                  />
                  Admin
                </CardTitle>
                <CardDescription>Manage users and roles</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

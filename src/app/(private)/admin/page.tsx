import { headers } from "next/headers";
import { redirect } from "next/navigation";

import UsersTable from "@/components/Admin/UsersTable";
import { auth } from "@/lib/auth";

const AdminPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-3xl font-semibold">Admin</h1>
        <p className="text-muted-foreground text-sm">
          Manage users, roles, and bans
        </p>
      </div>

      <UsersTable />
    </div>
  );
};

export default AdminPage;

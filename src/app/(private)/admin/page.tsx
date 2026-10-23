import { headers } from "next/headers";
import { redirect } from "next/navigation";

import UsersTable from "@/components/Admin/UsersTable";
import PageContainer from "@/components/Layout/PageContainer";
import { auth } from "@/lib/auth";

const AdminPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role !== "admin") {
    redirect("/feed");
  }

  return (
    <PageContainer className="flex flex-col gap-6 py-10">
      <UsersTable />
    </PageContainer>
  );
};

export default AdminPage;

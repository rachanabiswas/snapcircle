import Link from "next/link";
import { headers } from "next/headers";

import SignOutButton from "@/components/Auth/SignOutButton";
import { auth } from "@/lib/auth";
import UserDrawer from "./UserDrawer";

const Header = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user ?? null;

  return (
    <header
      className="bg-background fixed top-0 right-0 left-0 z-50 border-b shadow"
      aria-label="app-header">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href={"/"}>
          <h1
            className="text-2xl font-semibold"
            aria-label="App Name">
            SnapCircle
          </h1>
        </Link>

        <nav className="flex items-center gap-4">
          <Link href={"/"}>Home</Link>

          {user && <SignOutButton />}

          <UserDrawer user={user} />
        </nav>
      </div>
    </header>
  );
};

export default Header;

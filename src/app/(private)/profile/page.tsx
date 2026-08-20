import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your SnapCircle profile",
};

const ProfilePage = () => {
  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <p className="text-muted-foreground">
        Your profile page is under construction.
      </p>
    </main>
  );
};

export default ProfilePage;

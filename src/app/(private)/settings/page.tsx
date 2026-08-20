import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your SnapCircle settings",
};

const SettingsPage = () => {
  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="text-muted-foreground">
        Your settings page is under construction.
      </p>
    </main>
  );
};

export default SettingsPage;

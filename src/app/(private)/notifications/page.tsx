import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Your SnapCircle notifications",
};

const NotificationsPage = () => {
  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="text-2xl font-semibold">Notifications</h1>
      <p className="text-muted-foreground">
        Your notifications page is under construction.
      </p>
    </main>
  );
};

export default NotificationsPage;

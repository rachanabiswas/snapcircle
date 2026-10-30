import { headers } from "next/headers";

import PageContainer from "@/components/Layout/PageContainer";
import NotificationsPane from "@/components/Notifications/NotificationsPane";
import { auth } from "@/lib/auth";
import {
  fetchNotificationCounts,
  fetchNotificationItems,
} from "@/lib/notificationsGrouping";

export const metadata = {
  title: "Notifications",
  description: "Your SnapCircle notifications",
};

const NotificationsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const currentUserId = session?.user.id ?? "";

  // The (private) layout guarantees a session; an empty id still resolves
  // to empty data, so no extra branch is needed.
  const [counts, firstPage] = await Promise.all([
    fetchNotificationCounts(currentUserId),
    fetchNotificationItems(currentUserId, null),
  ]);

  return (
    <PageContainer className="max-w-7xl">
      <NotificationsPane
        initialItems={firstPage.items}
        initialCursor={firstPage.nextCursor}
        counts={counts}
      />
    </PageContainer>
  );
};

export default NotificationsPage;

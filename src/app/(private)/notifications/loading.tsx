import PageContainer from "@/components/Layout/PageContainer";
import { Skeleton } from "@/components/shadcnui/skeleton";

const notificationRowSkeleton = (key: number) => (
  <div
    key={key}
    className="flex items-center gap-3 rounded-xl border px-4 py-3">
    <Skeleton className="size-2 rounded-full" />
    <Skeleton className="size-8 shrink-0 rounded-full" />
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <Skeleton className="h-3.5 w-40" />
      <Skeleton className="h-3 w-full max-w-64" />
    </div>
    <Skeleton className="size-12 shrink-0 rounded-md" />
  </div>
);

const NotificationsLoading = () => {
  return (
    <PageContainer className="max-w-7xl">
      <div className="flex flex-wrap items-center gap-2 lg:hidden">
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="ml-auto h-8 w-28 rounded-full" />
      </div>

      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[minmax(200px,220px)_minmax(0,1fr)]">
        <aside className="hidden flex-col gap-3 lg:sticky lg:top-16 lg:flex">
          <div className="flex flex-col gap-3 rounded-xl border p-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="flex flex-col gap-3 rounded-xl border p-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-full" />
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-2">
          {[0, 1, 2, 3, 4, 5].map((key) => notificationRowSkeleton(key))}
        </div>
      </div>
    </PageContainer>
  );
};

export default NotificationsLoading;

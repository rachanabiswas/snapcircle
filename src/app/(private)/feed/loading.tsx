import PageContainer from "@/components/Layout/PageContainer";
import { Skeleton } from "@/components/shadcnui/skeleton";

const FeedLoading = () => {
  return (
    <PageContainer className="max-w-7xl py-6">
      <Skeleton className="h-28 w-full" />
      <Skeleton className="mt-3 h-44 w-full" />
      <div className="mt-3 grid grid-cols-1 items-start gap-3 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid min-w-0 grid-cols-1 items-start gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((key) => (
            <div
              key={key}
              className="flex flex-col gap-3 rounded-xl border p-6">
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
        <aside className="hidden flex-col gap-3 lg:flex">
          <div className="flex flex-col gap-3 rounded-xl border p-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="flex flex-col gap-3 rounded-xl border p-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex flex-col gap-3 rounded-xl border p-6">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-24" />
          </div>
        </aside>
      </div>
    </PageContainer>
  );
};

export default FeedLoading;

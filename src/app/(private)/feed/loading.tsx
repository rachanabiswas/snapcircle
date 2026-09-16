import { Skeleton } from "@/components/shadcnui/skeleton";

const FeedLoading = () => {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-4 flex flex-col gap-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-48 w-full" />
      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[1fr_300px]">
        <div className="grid min-w-0 items-start gap-4 sm:grid-cols-2">
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
            </div>
          ))}
        </div>
        <div className="hidden flex-col gap-4 lg:flex">
          <div className="flex flex-col gap-3 rounded-xl border p-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="flex flex-col gap-3 rounded-xl border p-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    </main>
  );
};

export default FeedLoading;

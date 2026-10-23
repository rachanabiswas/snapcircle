import { Skeleton } from "@/components/shadcnui/skeleton";

const SettingsSectionLoading = () => {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
};

export default SettingsSectionLoading;

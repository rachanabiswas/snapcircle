import Link from "next/link";

import { buttonVariants } from "@/components/shadcnui/button";

const NotFoundPage = () => {
  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <span
          className="bg-primary text-primary-foreground font-heading flex size-12 items-center justify-center rounded-md text-lg font-semibold"
          aria-hidden="true">
          S
        </span>
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold">
            This page doesn&apos;t exist
          </h1>
          <p className="text-muted-foreground text-sm">
            The link you followed is broken or the page was removed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/feed"
            className={buttonVariants({ variant: "default", size: "sm" })}>
            Back to feed
          </Link>
          <Link
            href="/profile"
            className={buttonVariants({ variant: "outline", size: "sm" })}>
            My profile
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFoundPage;

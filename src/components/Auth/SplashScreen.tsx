"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const HOLD_MS = 1900;
const EXIT_MS = 280;

const SplashScreen = () => {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);
  const hasStarted = useRef(false);
  const timers = useRef<number[]>([]);

  const finish = useCallback(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    setIsLeaving(true);
    timers.current.push(
      window.setTimeout(() => router.replace("/login"), EXIT_MS),
    );
  }, [router]);

  useEffect(() => {
    timers.current.push(window.setTimeout(finish, HOLD_MS));

    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current = [];
    };
  }, [finish]);

  return (
    <div
      data-leaving={isLeaving ? "true" : undefined}
      className="splash-shell relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0">
        <div className="splash-glow splash-glow-warm" />
        <div className="splash-glow splash-glow-cool" />
      </div>

      <div className="relative flex flex-col items-center text-center">
        <div className="relative flex items-center justify-center">
          <span
            aria-hidden="true"
            className="splash-halo"
          />
          <span
            aria-hidden="true"
            className="splash-mark-glow"
          />
          <Image
            src="/brand/snapcircle-mark.png"
            alt=""
            width={224}
            height={224}
            preload
            className="splash-mark ring-foreground/10 relative size-40 rounded-full ring-1 sm:size-52"
          />
        </div>

        <div className="splash-copy mt-8 flex flex-col items-center">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            SnapCircle
          </h1>
          <p
            role="status"
            className="text-muted-foreground mt-2 flex items-center gap-1 text-sm">
            <span>Loading SnapCircle</span>
            <span
              aria-hidden="true"
              className="flex items-end gap-0.5 pb-0.5">
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="splash-dot size-1 rounded-full bg-current"
                  style={{ animationDelay: `${dot * 140}ms` }}
                />
              ))}
            </span>
          </p>
          <div
            aria-hidden="true"
            className="bg-foreground/10 mt-6 h-1 w-44 overflow-hidden rounded-full">
            <span className="splash-progress block h-full w-1/2 rounded-full bg-gradient-to-r from-teal-400 via-pink-400 to-amber-400" />
          </div>
        </div>
      </div>

      <Link
        href="/login"
        onClick={(event) => {
          event.preventDefault();
          finish();
        }}
        className="text-muted-foreground hover:text-foreground absolute bottom-8 text-xs underline-offset-4 transition-colors hover:underline">
        Skip intro
      </Link>
    </div>
  );
};

export default SplashScreen;

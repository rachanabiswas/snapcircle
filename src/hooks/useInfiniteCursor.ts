"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CursorPage<T> =
  | { ok: true; items: T[]; nextCursor: string | null }
  | { ok: false; error: string };

type UseInfiniteCursorOptions<T> = {
  initialCursor: string | null;
  fetchPage: (cursor: string) => Promise<CursorPage<T>>;
  onAppend: (items: T[]) => void;
};

const SENTINEL_MARGIN_PX = 600;

/**
 * Drives cursor-based append pagination. The sentinel element (via
 * `sentinelRef`) triggers the next page whenever it is within
 * `SENTINEL_MARGIN_PX` of the viewport; a follow-up visibility check catches
 * the case where a finished batch still leaves the sentinel in view.
 * `loadMore` doubles as the retry path for failed batches.
 */
const useInfiniteCursor = <T>({
  initialCursor,
  fetchPage,
  onAppend,
}: UseInfiniteCursorOptions<T>) => {
  const [hasMore, setHasMore] = useState(initialCursor !== null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentinel, setSentinel] = useState<HTMLElement | null>(null);

  const cursorRef = useRef<string | null>(initialCursor);
  const inFlightRef = useRef(false);
  const fetchPageRef = useRef(fetchPage);
  const onAppendRef = useRef(onAppend);

  useEffect(() => {
    fetchPageRef.current = fetchPage;
  }, [fetchPage]);
  useEffect(() => {
    onAppendRef.current = onAppend;
  }, [onAppend]);

  const loadMore = useCallback(async () => {
    if (inFlightRef.current || cursorRef.current === null) return;
    inFlightRef.current = true;
    setIsLoading(true);
    setError(null);

    const result = await fetchPageRef.current(cursorRef.current);
    if (result.ok) {
      cursorRef.current = result.nextCursor;
      setHasMore(result.nextCursor !== null);
      onAppendRef.current(result.items);
    } else {
      setError(result.error);
    }

    inFlightRef.current = false;
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!sentinel || !hasMore || error) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadMore();
      },
      { rootMargin: `${SENTINEL_MARGIN_PX}px 0px` },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [error, hasMore, loadMore, sentinel]);

  useEffect(() => {
    if (!sentinel || !hasMore || error || isLoading) return;
    const rect = sentinel.getBoundingClientRect();
    if (rect.top < window.innerHeight + SENTINEL_MARGIN_PX) void loadMore();
  }, [error, hasMore, isLoading, loadMore, sentinel]);

  return { sentinelRef: setSentinel, hasMore, isLoading, error, loadMore };
};

export default useInfiniteCursor;

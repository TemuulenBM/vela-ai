"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createTracker, noopTracker, type Tracker } from "../lib/tracker";

export function useAnalytics(tenantId: string | undefined): Tracker {
  const trackerRef = useRef<Tracker>(noopTracker);
  const subscribersRef = useRef(new Set<() => void>());

  useEffect(() => {
    if (!tenantId) return;

    const instance = createTracker({ tenantId });
    trackerRef.current = instance;
    subscribersRef.current.forEach((cb) => cb());

    return () => {
      instance.destroy();
      trackerRef.current = noopTracker;
      subscribersRef.current.forEach((cb) => cb());
    };
  }, [tenantId]);

  return useSyncExternalStore(
    (cb) => {
      subscribersRef.current.add(cb);
      return () => subscribersRef.current.delete(cb);
    },
    () => trackerRef.current,
    () => noopTracker,
  );
}

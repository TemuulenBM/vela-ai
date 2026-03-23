"use client";

import { useEffect, useRef } from "react";
import { createTracker, noopTracker, type Tracker } from "../lib/tracker";

export function useAnalytics(tenantId: string | undefined): Tracker {
  const trackerRef = useRef<Tracker>(noopTracker);

  useEffect(() => {
    if (!tenantId) return;

    const tracker = createTracker({ tenantId });
    trackerRef.current = tracker;

    return () => {
      tracker.destroy();
      trackerRef.current = noopTracker;
    };
  }, [tenantId]);

  return trackerRef.current;
}

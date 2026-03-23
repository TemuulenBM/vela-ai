"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createTracker, noopTracker, type Tracker } from "../lib/tracker";

export function useAnalytics(tenantId: string | undefined): Tracker {
  const [tracker, setTracker] = useState<Tracker>(noopTracker);
  const trackerRef = useRef<Tracker>(noopTracker);

  useEffect(() => {
    if (!tenantId) return;

    const instance = createTracker({ tenantId });
    trackerRef.current = instance;
    setTracker(instance);

    return () => {
      instance.destroy();
      trackerRef.current = noopTracker;
      setTracker(noopTracker);
    };
  }, [tenantId]);

  return tracker;
}

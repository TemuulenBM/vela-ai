"use client";

import { useEffect, useRef } from "react";
import { Button, ProgressBar } from "@/shared/components/ui";
import { trpc } from "@/shared/lib/trpc";

const STATUS_LABELS: Record<string, string> = {
  pending: "Хүлээж байна",
  discovering: "Пост татаж байна",
  extracting: "AI задалж байна",
  embedding: "Embedding үүсгэж байна",
  completed: "Дууссан",
  failed: "Алдаа",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-white/20 text-white/60",
  discovering: "bg-amber-500/20 text-amber-400",
  extracting: "bg-blue-500/20 text-blue-400",
  embedding: "bg-purple-500/20 text-purple-400",
  completed: "bg-emerald-500/20 text-emerald-400",
  failed: "bg-red-500/20 text-[#ffb4ab]",
};

export function IGSyncStatus({ connectionId }: { connectionId: string }) {
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const utils = trpc.useUtils();

  const statusQuery = trpc.channels.getIgSyncStatus.useQuery(
    { connectionId },
    { refetchInterval: false },
  );

  const continueMutation = trpc.channels.continueIgSync.useMutation({
    onSuccess: () => utils.channels.getIgSyncStatus.invalidate(),
  });

  const resyncMutation = trpc.channels.resyncInstagram.useMutation({
    onSuccess: () => utils.channels.getIgSyncStatus.invalidate(),
  });

  const job = statusQuery.data;
  const isActive =
    job && ["pending", "discovering", "extracting", "embedding"].includes(job.status);

  // Client-driven polling: 3 секунд тутам status шинэчлэх + work үргэлжлүүлэх
  useEffect(() => {
    if (isActive && job) {
      pollingRef.current = setInterval(() => {
        utils.channels.getIgSyncStatus.invalidate();
        if (!continueMutation.isPending) {
          continueMutation.mutate({ jobId: job.id });
        }
      }, 3000);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [isActive, job?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Job байхгүй бол юу ч харуулахгүй
  if (!job) return null;

  const progress =
    job.totalFound > 0 && job.status === "extracting"
      ? Math.min((job.cursor / job.totalFound) * 100, 100)
      : job.status === "completed"
        ? 100
        : 0;

  return (
    <div className="mt-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-white/30">auto_awesome</span>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Бараа импорт
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${STATUS_COLORS[job.status] ?? STATUS_COLORS.pending}`}
        >
          {STATUS_LABELS[job.status] ?? job.status}
        </span>
      </div>

      {/* Progress */}
      {isActive && job.totalFound > 0 && (
        <div className="mt-3">
          <ProgressBar value={progress} height={4} color="rgba(255,255,255,0.2)" />
          <p className="mt-1.5 text-right text-[11px] text-white/30 tabular-nums">
            {job.cursor} / {job.totalFound} пост
          </p>
        </div>
      )}

      {/* Stats */}
      {(job.totalImported > 0 || job.totalSkipped > 0 || job.status === "completed") && (
        <div className="mt-3 flex items-center gap-4 text-[11px] text-white/40">
          {job.totalImported > 0 && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-emerald-400">
                add_circle
              </span>
              {job.totalImported} бараа
            </span>
          )}
          {job.totalUpdated > 0 && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-blue-400">sync</span>
              {job.totalUpdated} шинэчлэгдсэн
            </span>
          )}
          {job.totalSkipped > 0 && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-white/30">skip_next</span>
              {job.totalSkipped} алгассан
            </span>
          )}
        </div>
      )}

      {/* Error */}
      {job.error && <p className="mt-2 text-[11px] text-[#ffb4ab]">{job.error}</p>}

      {/* Re-sync button (completed/failed үед) */}
      {(job.status === "completed" || job.status === "failed") && (
        <div className="mt-3 flex items-center justify-between">
          {job.completedAt && (
            <p className="text-[10px] text-white/25">
              {new Date(job.completedAt).toLocaleString("mn-MN")}
            </p>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => resyncMutation.mutate({ connectionId })}
            disabled={resyncMutation.isPending}
          >
            <span
              className={`material-symbols-outlined text-[14px] ${resyncMutation.isPending ? "animate-spin" : ""}`}
            >
              sync
            </span>
            {resyncMutation.isPending ? "Синк хийж байна..." : "Дахин синк"}
          </Button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { Button, ProgressBar, Input } from "@/shared/components/ui";
import { trpc } from "@/shared/lib/trpc";

const STATUS_LABELS: Record<string, string> = {
  pending: "Хүлээж байна",
  discovering: "URL хайж байна",
  extracting: "Бараа татаж байна",
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

export function ImportTab() {
  const [url, setUrl] = useState("");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const statusQuery = trpc.crawler.getCrawlStatus.useQuery(undefined, {
    refetchInterval: false,
  });
  const utils = trpc.useUtils();

  const startMutation = trpc.crawler.startCrawl.useMutation({
    onSuccess: () => {
      utils.crawler.getCrawlStatus.invalidate();
    },
  });

  const continueMutation = trpc.crawler.continueWork.useMutation({
    onSuccess: () => {
      utils.crawler.getCrawlStatus.invalidate();
    },
  });

  const cancelMutation = trpc.crawler.cancelCrawl.useMutation({
    onSuccess: () => {
      utils.crawler.getCrawlStatus.invalidate();
    },
  });

  const job = statusQuery.data;
  const isActive =
    job && ["pending", "discovering", "extracting", "embedding"].includes(job.status);

  // Client-driven polling: refetch status + continue work every 3s
  useEffect(() => {
    if (isActive && job) {
      pollingRef.current = setInterval(() => {
        utils.crawler.getCrawlStatus.invalidate();
        // Only call continueWork if previous call finished (prevent race condition)
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

  // Pre-fill URL from last crawl
  const prefilled = useRef(false);
  if (job?.websiteUrl && !prefilled.current && !url) {
    prefilled.current = true;
    setUrl(job.websiteUrl);
  }

  const handleStart = () => {
    if (!url.trim()) return;
    startMutation.mutate({ websiteUrl: url.trim() });
  };

  const progress =
    job && job.totalFound > 0 ? Math.min((job.cursor / job.totalFound) * 100, 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* URL Input Section */}
      <div className="glass-card rounded-3xl p-8">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
          ВЭБСАЙТ ИМПОРТ
        </p>
        <h3 className="mt-2 font-serif text-2xl italic text-white">Сайтаас бараа автомат татах</h3>
        <p className="mt-2 text-sm text-white/40">
          Таны e-commerce сайтын URL оруулахад sitemap.xml-аас бараа хуудсуудыг автоматаар олж,
          мэдээллийг татаж авна.
        </p>

        <div className="mt-6 flex items-end gap-3">
          <div className="flex-1">
            <Input
              label="ВЭБСАЙТ URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://myshop.mn"
              disabled={isActive || startMutation.isPending}
              suffix={<span className="material-symbols-outlined text-[20px]">language</span>}
            />
          </div>
          {isActive ? (
            <Button
              variant="glass"
              size="md"
              onClick={() => job && cancelMutation.mutate({ jobId: job.id })}
              disabled={cancelMutation.isPending}
            >
              <span className="material-symbols-outlined text-[18px]">stop</span>
              Зогсоох
            </Button>
          ) : (
            <Button
              size="md"
              onClick={handleStart}
              disabled={!url.trim() || startMutation.isPending}
            >
              <span className="material-symbols-outlined text-[18px]">radar</span>
              {startMutation.isPending ? "Эхлүүлж байна..." : "Скан хийх"}
            </Button>
          )}
        </div>

        {startMutation.error && (
          <p className="mt-3 text-sm text-[#ffb4ab]">{startMutation.error.message}</p>
        )}
      </div>

      {/* Crawl Progress */}
      {job && (
        <div className="glass-card rounded-3xl p-8">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
              ИМПОРТЫН ЯВЦ
            </p>
            <span
              className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${STATUS_COLORS[job.status] ?? STATUS_COLORS.pending}`}
            >
              {STATUS_LABELS[job.status] ?? job.status}
            </span>
          </div>

          {/* Progress bar */}
          {isActive && job.totalFound > 0 && (
            <div className="mt-4">
              <ProgressBar value={progress} height={6} color="rgba(255,255,255,0.25)" />
              <p className="mt-2 text-right text-xs text-white/40 tabular-nums">
                {job.cursor} / {job.totalFound} URL
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="mt-6 grid grid-cols-4 gap-4">
            <StatCard label="Олдсон" value={job.totalFound} icon="search" />
            <StatCard label="Импортлосон" value={job.totalImported} icon="add_circle" />
            <StatCard label="Шинэчлэгдсэн" value={job.totalUpdated} icon="sync" />
            <StatCard label="Алгассан" value={job.totalSkipped} icon="skip_next" />
          </div>

          {/* Error */}
          {job.error && (
            <div className="mt-4 rounded-2xl bg-[#ffb4ab]/10 px-4 py-3 text-sm text-[#ffb4ab]">
              {job.error}
            </div>
          )}

          {/* Completed summary */}
          {job.status === "completed" && job.completedAt && (
            <p className="mt-4 text-xs text-white/30">
              Дууссан: {new Date(job.completedAt).toLocaleString("mn-MN")}
            </p>
          )}
        </div>
      )}

      {/* How it works */}
      <div className="glass-card rounded-3xl p-8">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
          ХЭРХЭН АЖИЛЛАДАГ
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {[
            {
              icon: "travel_explore",
              text: "Sitemap.xml-аас бараа хуудсуудыг автоматаар олно",
            },
            {
              icon: "data_object",
              text: "JSON-LD, Open Graph мэдээллээс бараа нэр, үнэ, тодорхойлолт татна",
            },
            {
              icon: "psychology",
              text: "AI embedding үүсгэж чатаар хайх боломжтой болгоно",
            },
            {
              icon: "sync",
              text: "Дахин скан хийхэд шинэ бараа нэмэгдэж, хуучин нь шинэчлэгдэнэ",
            },
          ].map((item) => (
            <div key={item.icon} className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px] text-white/30 mt-0.5">
                {item.icon}
              </span>
              <p className="text-sm text-white/50">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/[0.04] p-4">
      <span className="material-symbols-outlined text-[20px] text-white/30">{icon}</span>
      <span className="text-2xl font-semibold text-white tabular-nums">{value}</span>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
        {label}
      </span>
    </div>
  );
}

"use client";

import { useState } from "react";
import { trpc } from "@/shared/lib/trpc";

export function GeneralTab() {
  const storeQuery = trpc.tenants.getStore.useQuery();
  const utils = trpc.useUtils();
  const updateMutation = trpc.tenants.updateStore.useMutation({
    onSuccess: () => utils.tenants.getStore.invalidate(),
  });

  const store = storeQuery.data;
  const settings = (store?.settings as Record<string, unknown> | null) ?? {};

  const [name, setName] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);

  const displayName = name ?? store?.name ?? "";
  const displaySlug = slug ?? store?.slug ?? "";
  const displayDesc = description ?? (settings.description as string) ?? "";

  const handleSave = () => {
    updateMutation.mutate({
      name: displayName || undefined,
      slug: displaySlug || undefined,
      description: displayDesc || undefined,
    });
  };

  if (storeQuery.isLoading) {
    return (
      <div className="glass-card rounded-3xl p-8">
        <div className="h-48 animate-pulse rounded-2xl bg-white/[0.04]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Store Info Card */}
      <div className="glass-card rounded-3xl p-8">
        <div className="mb-8">
          <h2 className="font-headline text-2xl italic text-white">Дэлгүүрийн мэдээлэл</h2>
          <p className="mt-1 text-sm text-white/40">Дэлгүүрийн ерөнхий мэдээллийг засварлах</p>
        </div>

        <div className="flex max-w-lg flex-col gap-6">
          {/* Store Name */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
              ДЭЛГҮҮРИЙН НЭР
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setName(e.target.value)}
              placeholder="Дэлгүүрийн нэрийг оруулна уу"
              className="rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none ring-1 ring-white/[0.06] transition-all focus:ring-white/20"
            />
          </div>

          {/* Slug */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
              SLUG
            </label>
            <input
              type="text"
              value={displaySlug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="vela-shop"
              className="rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none ring-1 ring-white/[0.06] transition-all focus:ring-white/20 font-mono"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
              ТАЙЛБАР
            </label>
            <textarea
              value={displayDesc}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Дэлгүүрийн тайлбарыг оруулна уу"
              rows={3}
              className="resize-none rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none ring-1 ring-white/[0.06] transition-all focus:ring-white/20"
            />
          </div>
        </div>

        {/* Save */}
        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="rounded-full bg-white px-6 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-black transition-all hover:bg-white/90 disabled:opacity-50"
          >
            {updateMutation.isPending ? "Хадгалж байна..." : "Хадгалах"}
          </button>
          {updateMutation.isSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-white/40">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Хадгалагдсан
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

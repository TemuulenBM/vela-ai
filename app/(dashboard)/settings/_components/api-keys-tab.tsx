"use client";

import { useState } from "react";
import { trpc } from "@/shared/lib/trpc";

export function ApiKeysTab() {
  const keysQuery = trpc.tenants.listApiKeys.useQuery();
  const utils = trpc.useUtils();
  const createMutation = trpc.tenants.createApiKey.useMutation({
    onSuccess: () => utils.tenants.listApiKeys.invalidate(),
  });
  const revokeMutation = trpc.tenants.revokeApiKey.useMutation({
    onSuccess: () => utils.tenants.listApiKeys.invalidate(),
  });

  const [newKeyName, setNewKeyName] = useState("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;
    const result = await createMutation.mutateAsync({ name: newKeyName.trim() });
    setRevealedKey(result.key);
    setNewKeyName("");
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const keys = keysQuery.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Create new key */}
      <div className="glass-card rounded-3xl p-8">
        <div className="mb-6">
          <h2 className="font-headline text-2xl italic text-white">API түлхүүрүүд</h2>
          <p className="mt-1 text-sm text-white/40">
            API түлхүүрүүдийг удирдах. Түлхүүрүүдийг нууцаар хадгална уу.
          </p>
        </div>

        <div className="flex items-end gap-3">
          <div className="flex-1 flex flex-col gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
              ШИНЭ ТҮЛХҮҮРИЙН НЭР
            </label>
            <input
              type="text"
              placeholder="Жишээ нь: Production key"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none ring-1 ring-white/[0.06] transition-all focus:ring-white/20"
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={createMutation.isPending || !newKeyName.trim()}
            className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-black transition-all hover:bg-white/90 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Үүсгэх
          </button>
        </div>

        {/* Revealed key alert */}
        {revealedKey && (
          <div className="mt-4 rounded-2xl bg-[#ffd59e]/10 p-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#ffd59e]">
              Түлхүүрийг хуулж аваарай — дахин харагдахгүй
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 break-all rounded-xl bg-white/[0.05] px-3 py-2 text-xs font-mono text-white">
                {revealedKey}
              </code>
              <button
                onClick={() => handleCopy(revealedKey)}
                className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"
              >
                <span className="material-symbols-outlined text-[18px] text-white">
                  {copied ? "check" : "content_copy"}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Keys list */}
      <div className="glass-card rounded-3xl overflow-hidden">
        {keysQuery.isLoading ? (
          <div className="space-y-2 p-8">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-2xl bg-white/[0.04]" />
            ))}
          </div>
        ) : keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="material-symbols-outlined mb-3 text-[32px] text-white/20">key</span>
            <p className="text-sm text-white/40">API түлхүүр байхгүй байна</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-8 py-4 text-left text-[10px] font-semibold uppercase tracking-widest text-white/40">
                    Нэр
                  </th>
                  <th className="px-8 py-4 text-left text-[10px] font-semibold uppercase tracking-widest text-white/40">
                    Угтвар
                  </th>
                  <th className="px-8 py-4 text-left text-[10px] font-semibold uppercase tracking-widest text-white/40">
                    Үүсгэсэн
                  </th>
                  <th className="px-8 py-4 text-left text-[10px] font-semibold uppercase tracking-widest text-white/40">
                    Сүүлд ашигласан
                  </th>
                  <th className="w-20 px-8 py-4" />
                </tr>
              </thead>
              <tbody>
                {keys.map((apiKey) => (
                  <tr
                    key={apiKey.id}
                    className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[18px] text-white/30">
                          key
                        </span>
                        <span className="text-sm font-medium text-white">{apiKey.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <code className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-mono text-white/60">
                        {apiKey.keyPrefix}...
                      </code>
                    </td>
                    <td className="px-8 py-4 text-sm text-white/50">
                      {new Date(apiKey.createdAt).toLocaleDateString("mn-MN")}
                    </td>
                    <td className="px-8 py-4 text-sm text-white/50">
                      {apiKey.lastUsedAt
                        ? new Date(apiKey.lastUsedAt).toLocaleDateString("mn-MN")
                        : "—"}
                    </td>
                    <td className="px-8 py-4">
                      <button
                        onClick={() => revokeMutation.mutate({ id: apiKey.id })}
                        disabled={revokeMutation.isPending}
                        className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                        Устгах
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Widget embed snippet */}
      <div className="glass-card rounded-3xl p-8">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/40">
          ВИДЖЕТ EMBED КОД
        </p>
        <div className="rounded-2xl bg-white/[0.04] p-4">
          <code className="block text-xs font-mono text-white/60">
            {`<script src="${typeof window !== "undefined" ? window.location.origin : ""}/api/widget?key=YOUR_API_KEY" async></script>`}
          </code>
        </div>
      </div>
    </div>
  );
}

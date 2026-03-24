"use client";

import { useState } from "react";
import { Key, Plus, Trash2, Copy, Check } from "lucide-react";
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Button,
} from "@/shared/components/ui";
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
    <Card padding="none">
      <div className="flex items-center justify-between px-5 pb-0 pt-5">
        <div className="flex flex-col gap-1.5">
          <CardTitle>API түлхүүрүүд</CardTitle>
          <CardDescription>
            API түлхүүрүүдийг удирдах. Түлхүүрүүдийг нууцаар хадгална уу.
          </CardDescription>
        </div>
      </div>

      {/* Create new key */}
      <div className="flex items-end gap-3 px-5 py-4">
        <div className="flex-1">
          <Input
            label="Шинэ түлхүүрийн нэр"
            placeholder="Жишээ нь: Production key"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
          />
        </div>
        <Button
          size="sm"
          onClick={handleCreate}
          disabled={createMutation.isPending || !newKeyName.trim()}
        >
          <Plus className="h-4 w-4" />
          Үүсгэх
        </Button>
      </div>

      {/* Revealed key alert */}
      {revealedKey && (
        <div className="mx-5 mb-4 rounded-[var(--radius-md)] border border-amber-200 bg-amber-50 p-3">
          <p className="mb-1 text-xs font-medium text-amber-800">
            Түлхүүрийг хуулж аваарай. Дахин харагдахгүй!
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all rounded-[var(--radius-sm)] bg-white px-2 py-1 text-xs font-mono text-text-primary">
              {revealedKey}
            </code>
            <Button variant="secondary" size="sm" onClick={() => handleCopy(revealedKey)}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      )}

      <CardContent className="px-0">
        {keysQuery.isLoading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-[var(--radius-md)] bg-surface-secondary"
              />
            ))}
          </div>
        ) : keys.length === 0 ? (
          <div className="py-8 text-center">
            <Key className="mx-auto mb-2 h-6 w-6 text-text-tertiary" />
            <p className="text-sm text-text-secondary">API түлхүүр байхгүй байна</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                    Нэр
                  </th>
                  <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                    Prefix
                  </th>
                  <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                    Үүсгэсэн
                  </th>
                  <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                    Сүүлд ашигласан
                  </th>
                  <th className="w-20 px-5 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {keys.map((apiKey) => (
                  <tr key={apiKey.id}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-text-tertiary" />
                        <span className="text-sm font-medium text-text-primary">{apiKey.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <code className="rounded-[var(--radius-sm)] bg-surface-tertiary px-2 py-1 text-xs font-mono text-text-secondary">
                        {apiKey.keyPrefix}...
                      </code>
                    </td>
                    <td className="px-5 py-3 text-sm text-text-secondary">
                      {new Date(apiKey.createdAt).toLocaleDateString("mn-MN")}
                    </td>
                    <td className="px-5 py-3 text-sm text-text-secondary">
                      {apiKey.lastUsedAt
                        ? new Date(apiKey.lastUsedAt).toLocaleDateString("mn-MN")
                        : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => revokeMutation.mutate({ id: apiKey.id })}
                        disabled={revokeMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Устгах
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* Embed snippet */}
      <div className="border-t border-border-default px-5 py-4">
        <p className="mb-2 text-xs font-medium text-text-secondary">Widget embed код</p>
        <div className="rounded-[var(--radius-md)] bg-surface-tertiary p-3">
          <code className="block text-xs font-mono text-text-secondary">
            {`<script src="${typeof window !== "undefined" ? window.location.origin : ""}/api/widget?key=YOUR_API_KEY" async></script>`}
          </code>
        </div>
      </div>
    </Card>
  );
}

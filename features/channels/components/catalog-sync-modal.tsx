"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/shared/components/ui/modal";
import { trpc } from "@/shared/lib/trpc";
import { useChannels } from "../hooks/use-channels";
import type { CatalogInfo } from "../types";

export function CatalogSyncModal({
  connectionId,
  onClose,
}: {
  connectionId: string | null;
  onClose: () => void;
}) {
  const { syncCatalog } = useChannels();
  const [syncResult, setSyncResult] = useState<{
    created: number;
    updated: number;
    total: number;
  } | null>(null);

  const catalogsQuery = trpc.channels.getPageCatalogs.useQuery(
    { connectionId: connectionId! },
    { enabled: !!connectionId },
  );

  const handleSync = async (catalogId: string) => {
    if (!connectionId) return;
    try {
      const result = await syncCatalog.mutateAsync({ connectionId, catalogId });
      setSyncResult(result);
    } catch (err) {
      console.error("Sync failed:", err);
    }
  };

  const handleClose = () => {
    setSyncResult(null);
    onClose();
  };

  return (
    <Modal open={!!connectionId} onOpenChange={handleClose}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Бүтээгдэхүүн синк</ModalTitle>
          <ModalDescription>
            {syncResult
              ? "Синк амжилттай дууслаа"
              : "Facebook Catalog-аас бүтээгдэхүүнүүдийг татаж синк хийнэ"}
          </ModalDescription>
        </ModalHeader>
        <div className="px-6 pb-4">
          {syncResult ? (
            <SyncResultView result={syncResult} />
          ) : catalogsQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
            </div>
          ) : catalogsQuery.data && catalogsQuery.data.length > 0 ? (
            <CatalogList
              catalogs={catalogsQuery.data}
              isSyncing={syncCatalog.isPending}
              onSync={handleSync}
            />
          ) : (
            <p className="py-4 text-center text-sm text-white/40">
              {catalogsQuery.isError
                ? "Catalog авахад алдаа гарлаа. catalog_management permission шалгана уу."
                : "Энэ Page-д холбогдсон Catalog олдсонгүй."}
            </p>
          )}
        </div>
        <ModalFooter>
          <Button variant="glass" onClick={handleClose}>
            {syncResult ? "Хаах" : "Болих"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function SyncResultView({
  result,
}: {
  result: { created: number; updated: number; total: number };
}) {
  return (
    <div className="space-y-2 rounded-2xl bg-white/[0.04] p-4">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px] text-emerald-400">check_circle</span>
        <p className="text-sm font-medium text-white">Нийт {result.total} бүтээгдэхүүн</p>
      </div>
      <p className="text-xs text-white/40">
        Шинэ: {result.created} · Шинэчилсэн: {result.updated}
      </p>
    </div>
  );
}

function CatalogList({
  catalogs,
  isSyncing,
  onSync,
}: {
  catalogs: CatalogInfo[];
  isSyncing: boolean;
  onSync: (catalogId: string) => void;
}) {
  return (
    <div className="space-y-2">
      {catalogs.map((catalog) => (
        <button
          key={catalog.id}
          disabled={isSyncing}
          onClick={() => onSync(catalog.id)}
          className="flex w-full items-center justify-between rounded-2xl bg-white/[0.04] px-4 py-3 text-left transition-all hover:bg-white/[0.06] disabled:opacity-50"
        >
          <div>
            <p className="text-sm font-medium text-white">{catalog.name}</p>
            <p className="text-xs text-white/40">ID: {catalog.id}</p>
          </div>
          {isSyncing ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
          ) : (
            <span className="material-symbols-outlined text-[18px] text-white/40">sync</span>
          )}
        </button>
      ))}
    </div>
  );
}

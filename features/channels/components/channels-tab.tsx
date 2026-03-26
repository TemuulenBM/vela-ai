"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Badge, Button, Card } from "@/shared/components/ui";
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
import { CatalogSyncModal } from "./catalog-sync-modal";
import type { ChannelConnection } from "../types";

const STATUS_CONFIG = {
  active: { label: "Идэвхтэй", variant: "success" as const },
  disconnected: { label: "Салгасан", variant: "default" as const },
  token_expired: { label: "Token дууссан", variant: "warning" as const },
};

const PLATFORM_CONFIG = {
  messenger: { label: "Messenger", icon: "chat_bubble" },
  instagram: { label: "Instagram", icon: "photo_camera" },
};

export function ChannelsTab() {
  const searchParams = useSearchParams();
  const { connections, isLoading, connectPage, connectInstagram, disconnect, syncCatalog } =
    useChannels();
  const [showPageSelect, setShowPageSelect] = useState(false);
  const [disconnectTarget, setDisconnectTarget] = useState<string | null>(null);
  const [pagesData, setPagesData] = useState<string | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [connectIg, setConnectIg] = useState(true);
  const [syncTarget, setSyncTarget] = useState<string | null>(null);

  // Instagram Login states
  const [igData, setIgData] = useState<string | null>(null);
  const [showIgConfirm, setShowIgConfirm] = useState(false);

  const redirectUri =
    typeof window !== "undefined" ? `${window.location.origin}/api/auth/meta/callback` : null;
  const igRedirectUri =
    typeof window !== "undefined" ? `${window.location.origin}/api/auth/instagram/callback` : null;

  const oauthUrlQuery = trpc.channels.getMetaOAuthUrl.useQuery(
    { redirectUri: redirectUri! },
    { enabled: !!redirectUri },
  );

  const igOauthUrlQuery = trpc.channels.getInstagramOAuthUrl.useQuery(
    { redirectUri: igRedirectUri! },
    { enabled: !!igRedirectUri },
  );

  // Instagram callback data задлах
  const decryptIgQuery = trpc.channels.decryptInstagramData.useQuery(
    { igData: igData! },
    { enabled: !!igData },
  );

  // Server дээр encrypted pages задлах
  const decryptPagesQuery = trpc.channels.decryptPages.useQuery(
    { pagesData: pagesData! },
    { enabled: !!pagesData },
  );

  // OAuth callback-аас pages/ig data ирсэн бол dialog нээх (нэг удаа л ажиллана)
  const processedRef = useRef(false);
  useEffect(() => {
    if (processedRef.current) return;
    const metaPages = searchParams.get("meta_pages");
    const metaError = searchParams.get("meta_error");
    const igDataParam = searchParams.get("ig_data");
    const igError = searchParams.get("ig_error");

    if (!metaPages && !metaError && !igDataParam && !igError) return;
    processedRef.current = true;

    // URL-аас query params устгах
    const url = new URL(window.location.href);
    url.searchParams.delete("meta_pages");
    url.searchParams.delete("meta_error");
    url.searchParams.delete("ig_data");
    url.searchParams.delete("ig_error");
    url.searchParams.delete("tab");
    window.history.replaceState({}, "", url.toString());

    if (metaError) {
      console.error("Meta OAuth error:", metaError);
      return;
    }
    if (igError) {
      console.error("Instagram OAuth error:", igError);
      return;
    }

    if (metaPages) {
      queueMicrotask(() => {
        setPagesData(metaPages);
        setShowPageSelect(true);
      });
    }

    if (igDataParam) {
      queueMicrotask(() => {
        setIgData(igDataParam);
        setShowIgConfirm(true);
      });
    }
  }, [searchParams]);

  // Pages data decrypt болмогц selectedPageId auto-select
  const pages = decryptPagesQuery.data?.pages ?? [];
  const selectedPage = pages.find((p) => p.pageId === selectedPageId);
  const hasIgAccount = !!selectedPage?.igAccountId;

  const handleConnect = () => {
    if (oauthUrlQuery.data?.url) {
      window.location.href = oauthUrlQuery.data.url;
    }
  };

  const handleInstagramConnect = () => {
    if (igOauthUrlQuery.data?.url) {
      window.location.href = igOauthUrlQuery.data.url;
    }
  };

  const handleInstagramConfirm = async () => {
    if (!igData) return;
    try {
      await connectInstagram.mutateAsync({ igData });
      setShowIgConfirm(false);
      setIgData(null);
    } catch (err) {
      console.error("Instagram connect failed:", err);
    }
  };

  const handlePageSelect = async () => {
    if (!pagesData || !selectedPageId) return;

    try {
      await connectPage.mutateAsync({
        pagesData,
        selectedPageId,
        connectInstagram: connectIg && hasIgAccount,
      });
      setShowPageSelect(false);
      setPagesData(null);
      setSelectedPageId(null);

      // URL-аас query params устгах
      const url = new URL(window.location.href);
      url.searchParams.delete("meta_pages");
      url.searchParams.delete("meta_error");
      window.history.replaceState({}, "", url.toString());
    } catch (err) {
      console.error("Connect failed:", err);
    }
  };

  const handleDisconnect = async () => {
    if (!disconnectTarget) return;
    try {
      await disconnect.mutateAsync({ connectionId: disconnectTarget });
      setDisconnectTarget(null);
    } catch (err) {
      console.error("Disconnect failed:", err);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-3xl bg-white/[0.04]" />
        ))}
      </div>
    );
  }

  const activeConnections = connections.filter(
    (c: ChannelConnection) => c.status !== "disconnected",
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-2xl italic text-white">Сувгууд</h2>
          <p className="mt-1 text-sm text-white/40">
            Facebook Messenger, Instagram зэрэг сувгуудаа холбож, AI борлуулагчийг ажиллуулна
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleInstagramConnect}
            disabled={!igOauthUrlQuery.data?.url}
            className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] px-5 py-2.5 text-sm font-medium text-white shadow-[0_0_20px_rgba(221,42,123,0.25)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_0_28px_rgba(221,42,123,0.35)] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            Instagram холбох
          </button>
          <button
            onClick={handleConnect}
            disabled={!oauthUrlQuery.data?.url}
            className="group inline-flex items-center gap-2.5 rounded-full bg-[#1877F2] px-5 py-2.5 text-sm font-medium text-white shadow-[0_0_20px_rgba(24,119,242,0.25)] transition-all duration-200 hover:-translate-y-px hover:bg-[#1877F2]/90 hover:shadow-[0_0_28px_rgba(24,119,242,0.35)] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook холбох
          </button>
        </div>
      </div>

      {/* Connections */}
      {activeConnections.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center rounded-3xl py-20">
          <span className="material-symbols-outlined text-[48px] text-white/15">forum</span>
          <p className="mt-4 text-lg font-medium text-white/40">Суваг холбогдоогүй байна</p>
          <p className="mt-1 text-sm text-white/25">
            Facebook Page-ээ холбож Messenger дээр AI борлуулагч ажиллуулна уу
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeConnections.map((conn: ChannelConnection) => (
            <ConnectionCard
              key={conn.id}
              connection={conn}
              onDisconnect={() => setDisconnectTarget(conn.id)}
              onSync={() => setSyncTarget(conn.id)}
              isSyncing={syncCatalog.isPending && syncTarget === conn.id}
            />
          ))}
        </div>
      )}

      {/* Disconnect confirmation */}
      <Modal open={!!disconnectTarget} onOpenChange={() => setDisconnectTarget(null)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Суваг салгах</ModalTitle>
            <ModalDescription>
              Энэ сувгийг салгаснаар AI борлуулагч тухайн платформ дээр ажиллахаа болино.
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="glass" onClick={() => setDisconnectTarget(null)}>
              Болих
            </Button>
            <Button
              variant="destructive"
              disabled={disconnect.isPending}
              onClick={handleDisconnect}
            >
              {disconnect.isPending ? "Салгаж байна..." : "Салгах"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Page select dialog (after OAuth callback) */}
      <Modal open={showPageSelect} onOpenChange={setShowPageSelect}>
        <ModalContent>
          <ModalHeader>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1877F2]/15">
              <svg className="h-7 w-7 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <ModalTitle>Page сонгох</ModalTitle>
            <ModalDescription>AI борлуулагч холбох Facebook Page-ээ сонгоно уу</ModalDescription>
          </ModalHeader>

          <div className="mt-6">
            {decryptPagesQuery.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
              </div>
            ) : pages.length > 0 ? (
              <div className="space-y-3">
                {pages.map((page) => {
                  const isSelected = selectedPageId === page.pageId;
                  return (
                    <button
                      key={page.pageId}
                      onClick={() => setSelectedPageId(page.pageId)}
                      className={`group flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all ${
                        isSelected
                          ? "border-[#1877F2]/40 bg-[#1877F2]/10"
                          : "border-white/[0.06] bg-white/[0.03] hover:border-white/[0.12] hover:bg-white/[0.05]"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                          isSelected
                            ? "bg-[#1877F2]/20 text-[#1877F2]"
                            : "bg-white/[0.06] text-white/40"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">flag</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">{page.pageName}</p>
                        {page.igUsername && (
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-white/40">
                            <span className="material-symbols-outlined text-[12px]">
                              photo_camera
                            </span>
                            @{page.igUsername}
                          </p>
                        )}
                      </div>
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                          isSelected ? "border-[#1877F2] bg-[#1877F2]" : "border-white/20"
                        }`}
                      >
                        {isSelected && (
                          <span className="material-symbols-outlined text-[14px] text-white">
                            check
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}

                {hasIgAccount && (
                  <label className="mt-2 flex cursor-pointer items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-4 transition-all hover:border-white/[0.12] hover:bg-white/[0.05]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F58529]/20 via-[#DD2A7B]/20 to-[#8134AF]/20">
                      <span className="material-symbols-outlined text-[20px] text-[#DD2A7B]">
                        photo_camera
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">Instagram DM холбох</p>
                      <p className="text-xs text-white/40">
                        @{selectedPage?.igUsername} дээр AI хариулна
                      </p>
                    </div>
                    <div className="relative flex h-6 w-11 shrink-0 items-center rounded-full bg-white/10 transition-colors has-[:checked]:bg-[#1877F2]">
                      <input
                        type="checkbox"
                        checked={connectIg}
                        onChange={(e) => setConnectIg(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="absolute left-0.5 h-5 w-5 rounded-full bg-white/60 transition-all peer-checked:left-[22px] peer-checked:bg-white" />
                    </div>
                  </label>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center py-8">
                <span className="material-symbols-outlined text-[36px] text-white/15">warning</span>
                <p className="mt-3 text-sm text-white/40">
                  {decryptPagesQuery.isError
                    ? "Pages задлахад алдаа гарлаа. Дахин оролдоно уу."
                    : "Холбогдох Page олдсонгүй."}
                </p>
              </div>
            )}
          </div>

          <ModalFooter>
            <Button variant="glass" onClick={() => setShowPageSelect(false)}>
              Болих
            </Button>
            <Button
              disabled={connectPage.isPending || (!selectedPageId && pages.length > 0)}
              onClick={handlePageSelect}
            >
              {connectPage.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black/70" />
                  Холбож байна...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">link</span>
                  Холбох
                </>
              )}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Instagram confirm dialog (after IG OAuth callback) */}
      <Modal open={showIgConfirm} onOpenChange={setShowIgConfirm}>
        <ModalContent>
          <ModalHeader>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F58529]/15 via-[#DD2A7B]/15 to-[#8134AF]/15">
              <svg className="h-7 w-7 text-[#DD2A7B]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </div>
            <ModalTitle>Instagram холбох</ModalTitle>
            <ModalDescription>
              {decryptIgQuery.data
                ? `@${decryptIgQuery.data.igUsername} аккаунт дээр AI борлуулагч ажиллуулах уу?`
                : "Instagram аккаунт холбож байна..."}
            </ModalDescription>
          </ModalHeader>

          {decryptIgQuery.isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
            </div>
          )}

          {decryptIgQuery.data && (
            <div className="mt-4 flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F58529]/20 via-[#DD2A7B]/20 to-[#8134AF]/20">
                <span className="material-symbols-outlined text-[20px] text-[#DD2A7B]">
                  photo_camera
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">@{decryptIgQuery.data.igUsername}</p>
                <p className="text-xs text-white/40">Instagram DM</p>
              </div>
            </div>
          )}

          <ModalFooter>
            <Button
              variant="glass"
              onClick={() => {
                setShowIgConfirm(false);
                setIgData(null);
              }}
            >
              Болих
            </Button>
            <Button
              disabled={connectInstagram.isPending || !decryptIgQuery.data}
              onClick={handleInstagramConfirm}
            >
              {connectInstagram.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black/70" />
                  Холбож байна...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">link</span>
                  Холбох
                </>
              )}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Catalog sync modal */}
      <CatalogSyncModal connectionId={syncTarget} onClose={() => setSyncTarget(null)} />
    </div>
  );
}

function ConnectionCard({
  connection,
  onDisconnect,
  onSync,
  isSyncing,
}: {
  connection: ChannelConnection;
  onDisconnect: () => void;
  onSync: () => void;
  isSyncing: boolean;
}) {
  const platform = PLATFORM_CONFIG[connection.platform];
  const status = STATUS_CONFIG[connection.status];

  return (
    <Card variant="glass" padding="md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06]">
            <span className="material-symbols-outlined text-[24px] text-white/60">
              {platform.icon}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-white">
                {connection.pageName ?? connection.pageId}
              </p>
              <Badge variant={status.variant} size="sm">
                {status.label}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-white/40">
              {platform.label}
              {connection.igUsername && ` · @${connection.igUsername}`}
              {connection.lastSyncAt && (
                <>
                  {" · "}
                  Сүүлд синк: {new Date(connection.lastSyncAt).toLocaleDateString("mn-MN")}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onSync} disabled={isSyncing}>
            <span
              className={`material-symbols-outlined text-[18px] text-white/40 ${isSyncing ? "animate-spin" : ""}`}
            >
              sync
            </span>
          </Button>
          <Button variant="ghost" size="sm" onClick={onDisconnect}>
            <span className="material-symbols-outlined text-[18px] text-white/40">link_off</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}

"use client";

import { useState, useEffect } from "react";
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
  const { connections, isLoading, connectPage, disconnect } = useChannels();
  const [showPageSelect, setShowPageSelect] = useState(false);
  const [disconnectTarget, setDisconnectTarget] = useState<string | null>(null);
  const [pagesData, setPagesData] = useState<string | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [connectIg, setConnectIg] = useState(true);

  const oauthUrlQuery = trpc.channels.getMetaOAuthUrl.useQuery(
    {
      redirectUri: `${typeof window !== "undefined" ? window.location.origin : ""}/api/auth/meta/callback`,
    },
    { enabled: typeof window !== "undefined" },
  );

  // Server дээр encrypted pages задлах
  const decryptPagesQuery = trpc.channels.decryptPages.useQuery(
    { pagesData: pagesData! },
    { enabled: !!pagesData },
  );

  // OAuth callback-аас pages data ирсэн бол dialog нээх
  useEffect(() => {
    const metaPages = searchParams.get("meta_pages");
    const metaError = searchParams.get("meta_error");

    if (metaError) {
      console.error("Meta OAuth error:", metaError);
      return;
    }

    if (metaPages) {
      setPagesData(metaPages);
      setShowPageSelect(true);
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
        <Button onClick={handleConnect} disabled={!oauthUrlQuery.data?.url}>
          <span className="material-symbols-outlined mr-2 text-[18px]">add</span>
          Facebook холбох
        </Button>
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
            <ModalTitle>Page сонгох</ModalTitle>
            <ModalDescription>AI борлуулагч холбох Facebook Page-ээ сонгоно уу</ModalDescription>
          </ModalHeader>
          <div className="px-6 pb-4">
            {decryptPagesQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
              </div>
            ) : pages.length > 0 ? (
              <div className="space-y-2">
                {pages.map((page) => (
                  <button
                    key={page.pageId}
                    onClick={() => setSelectedPageId(page.pageId)}
                    className={`w-full rounded-2xl px-4 py-3 text-left transition-all ${
                      selectedPageId === page.pageId
                        ? "bg-white/10 ring-1 ring-white/20"
                        : "bg-white/[0.04] hover:bg-white/[0.06]"
                    }`}
                  >
                    <p className="text-sm font-medium text-white">{page.pageName}</p>
                    {page.igUsername && (
                      <p className="mt-0.5 text-xs text-white/40">Instagram: @{page.igUsername}</p>
                    )}
                  </button>
                ))}

                {/* Instagram toggle — сонгосон page-д IG account байвал */}
                {hasIgAccount && (
                  <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-3">
                    <input
                      type="checkbox"
                      checked={connectIg}
                      onChange={(e) => setConnectIg(e.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-transparent accent-white"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">Instagram DM холбох</p>
                      <p className="text-xs text-white/40">
                        @{selectedPage?.igUsername} дээр ирсэн DM-д AI хариулна
                      </p>
                    </div>
                  </label>
                )}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-white/40">
                {decryptPagesQuery.isError
                  ? "Pages задлахад алдаа гарлаа. Дахин оролдоно уу."
                  : "OAuth амжилттай. Доорх товч дарж холбоно уу."}
              </p>
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
              {connectPage.isPending ? "Холбож байна..." : "Холбох"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

function ConnectionCard({
  connection,
  onDisconnect,
}: {
  connection: ChannelConnection;
  onDisconnect: () => void;
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
            </p>
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={onDisconnect}>
          <span className="material-symbols-outlined text-[18px] text-white/40">link_off</span>
        </Button>
      </div>
    </Card>
  );
}

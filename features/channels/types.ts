export interface ChannelConnection {
  id: string;
  platform: "messenger" | "instagram";
  pageId: string;
  pageName: string | null;
  igAccountId: string | null;
  igUsername: string | null;
  status: "active" | "disconnected" | "token_expired";
  catalogId: string | null;
  lastSyncAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CatalogInfo {
  id: string;
  name: string;
}

export interface MetaPageOption {
  pageId: string;
  pageName: string;
  igAccountId?: string;
  igUsername?: string;
}

export interface ChannelConnection {
  id: string;
  platform: "messenger" | "instagram";
  pageId: string;
  pageName: string | null;
  igAccountId: string | null;
  igUsername: string | null;
  status: "active" | "disconnected" | "token_expired";
  createdAt: Date;
  updatedAt: Date;
}

export interface MetaPageOption {
  pageId: string;
  pageName: string;
  pageAccessToken: string;
  igAccountId?: string;
  igUsername?: string;
}

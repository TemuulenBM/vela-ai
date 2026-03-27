/** Single Instagram media object from Graph API */
export interface IGMedia {
  id: string;
  caption?: string;
  media_url?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  timestamp: string;
  permalink: string;
  thumbnail_url?: string;
}

/** Paginated response from GET /me/media */
export interface IGMediaPage {
  data: IGMedia[];
  paging?: {
    cursors?: { before?: string; after?: string };
    next?: string;
  };
}

/** Claude Haiku-аар parse хийсэн бүтээгдэхүүний мэдээлэл */
export interface ParsedIGProduct {
  isProduct: boolean;
  name: string | null;
  price: string | null;
  description: string | null;
  category: string | null;
}

/** crawl_jobs.config JSONB дотор хадгалагдах IG sync тохиргоо */
export interface IGSyncConfig {
  source: "instagram";
  connectionId: string;
  igUserId: string;
  maxPosts?: number;
  /** Discover step-д pagination cursor хадгалах (resume-д ашиглана) */
  paginationCursor?: string;
}

/** State machine step-ийн үр дүн (CrawlStepResult-тай ижил) */
export interface IGSyncStepResult {
  done: boolean;
  nextStepNeeded: boolean;
  status: string;
  message?: string;
}

export interface ExtractedProduct {
  name: string;
  description?: string;
  price?: string;
  category?: string;
  brand?: string;
  imageUrl?: string;
  sourceUrl: string;
}

export interface CrawlStepResult {
  done: boolean;
  nextStepNeeded: boolean;
  status: string;
  message?: string;
}

export interface CrawlConfig {
  maxPages?: number;
  excludePatterns?: string[];
  productPathPatterns?: string[];
}

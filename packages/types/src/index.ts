export type ProductSummary = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  categoryName: string;
};

export type FilterOption = {
  slug: string;
  name: string;
  count: number;
};

export type ProductFiltersResponse = {
  categories: FilterOption[];
  crops: FilterOption[];
  programs: FilterOption[];
};

export type ProductsResponse = {
  items: ProductRecord[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pageCount: number;
  };
};

export type ProductRecord = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  manufacturer?: string | null;
  application?: string | null;
  cropTags: string[];
  benefits: string[];
  composition?: { html?: string } | null;
  dosage?: { text?: string } | null;
  category?: {
    id: string;
    slug: string;
    name: string;
  } | null;
  programs?: Array<{
    id: string;
    slug: string;
    title: string;
  }>;
};

export type PageRecord = {
  id: string;
  slug: string;
  path: string;
  title: string;
  content: string;
  excerpt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export type ArticleRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  publishedAt?: string | null;
};

export type BotResponse = {
  reply: string;
  leadCaptureRecommended: boolean;
  suggestedProducts?: Array<{
    id: string;
    slug: string;
    name: string;
    shortDescription: string;
  }>;
  suggestedPrograms?: Array<{
    id: string;
    slug: string;
    title: string;
    description: string;
  }>;
};

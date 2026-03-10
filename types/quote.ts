export interface QuoteData {
  id: string;
  text: string;
  attribution: string;
  socialHandles: string[];
  authorPhoto: string | null;
  backgroundId: string | null;
  fontPrimary: string | null;
  fontSecondary: string | null;
  colorPalette: string | null;
  mood: string | null;
  cardImageUrl: string | null;
  publishedAt: string | null;
  submitter?: {
    id: string;
    name: string;
    /** Custom uploaded photo — preferred over image (OAuth avatar) */
    profilePhoto: string | null;
    /** OAuth avatar (Google etc.) — fallback when profilePhoto is null */
    image: string | null;
  } | null;
}

export interface QuotesResponse {
  quotes: QuoteData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

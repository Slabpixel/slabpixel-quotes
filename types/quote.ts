export interface QuoteData {
  id: string;
  text: string;
  attribution: string;
  socialHandles: string[];
  authorPhoto: string | null;
  backgroundId: string | null;
  /** User-uploaded background (e.g. Vercel Blob); takes precedence over backgroundId when set */
  backgroundUrl: string | null;
  fontPrimary: string | null;
  fontSecondary: string | null;
  colorPalette: string | null;
  mood: string | null;
  cardImageUrl: string | null;
  /**
   * Quote status (e.g. PENDING / IN_REVIEW / PUBLISHED).
   * Optional because the public feed only fetches published quotes.
   */
  status?: string;
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

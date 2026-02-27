export interface QuoteData {
  id: string;
  text: string;
  attribution: string;
  socialHandle: string | null;
  authorPhoto: string | null;
  fontPrimary: string | null;
  fontSecondary: string | null;
  colorPalette: string | null;
  mood: string | null;
  cardImageUrl: string | null;
  publishedAt: string | null;
  submitter?: {
    id: string;
    name: string;
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

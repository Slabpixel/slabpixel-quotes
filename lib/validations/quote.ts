import { z } from "zod";

export const submitQuoteSchema = z.object({
  text: z
    .string()
    .min(10, "Quote must be at least 10 characters")
    .max(500, "Quote must be 500 characters or less"),
  attribution: z
    .string()
    .min(1, "Attribution is required")
    .max(100, "Attribution must be 100 characters or less"),
  socialHandles: z
    .array(z.string().max(200, "Each social handle must be 200 characters or less"))
    .max(5, "You can add up to 5 social handles")
    .optional()
    .default([]),
  authorPhoto: z.string().url().optional().nullable(),
  fontPrimary: z.string().max(100).optional().nullable(),
  fontSecondary: z.string().max(100).optional().nullable(),
  colorPalette: z.string().max(500).optional().nullable(),
  mood: z.string().max(50).optional().nullable(),
  backgroundId: z.string().max(100).optional().nullable(),
});

export const updateQuoteStatusSchema = z.object({
  status: z.enum(["PENDING", "IN_REVIEW", "APPROVED", "REJECTED", "PUBLISHED"]),
  designNotes: z.string().max(1000).optional().nullable(),
  cardImageUrl: z.string().url().optional().nullable(),
  fontPrimary: z.string().max(100).optional().nullable(),
  fontSecondary: z.string().max(100).optional().nullable(),
  colorPalette: z.string().max(500).optional().nullable(),
});

export type SubmitQuoteInput = z.infer<typeof submitQuoteSchema>;
export type UpdateQuoteStatusInput = z.infer<typeof updateQuoteStatusSchema>;

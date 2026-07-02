import { z } from "zod";

export type Lang = "en" | "da";

export type LangMap = {
  en: string;
  da: string;
};

export type ReferenceSource = {
  id: string;
  title: LangMap;
  subtitle: LangMap;
  url?: LangMap;
};

export type ReferenceDoc = {
  key: string;
  version: number;
  updatedAt: string;
  reviewDate?: string;
  disclaimer: LangMap;
  sourcesSub: LangMap;
  sources: ReferenceSource[];
};

const optionalLangMapSchema = z.object({
  en: z.string(),
  da: z.string(),
});

const titleSchema = z.object({
  en: z.string().refine((value) => value.trim().length > 0),
  da: z.string().refine((value) => value.trim().length > 0),
});

const urlMapSchema = z.object({
  en: z.url(),
  da: z.url(),
});

const dateMetadataSchema = z.union([
  z.iso.date(),
  z.iso.datetime({ offset: true }),
]);

export const referenceSourceSchema = z.object({
  id: z.string().refine((value) => value.trim().length > 0),
  title: titleSchema,
  subtitle: optionalLangMapSchema.optional(),
  url: urlMapSchema.optional(),
});

export const referencePayloadSchema = z.object({
  key: z.string().refine((value) => value.trim().length > 0).optional(),
  version: z.number().int().positive().optional(),
  updatedAt: dateMetadataSchema.optional(),
  reviewDate: dateMetadataSchema.optional(),
  disclaimer: optionalLangMapSchema.optional(),
  sourcesSub: optionalLangMapSchema.optional(),
  sources: z.array(referenceSourceSchema).optional(),
});

export type ReferencePayload = z.infer<typeof referencePayloadSchema>;

export function parseReferencePayload(value: unknown): ReferencePayload | null {
  const result = referencePayloadSchema.safeParse(value);
  return result.success ? result.data : null;
}

import { z } from "zod";

import type {
  Bydel,
  ByenCategory,
  HospitalCode,
  Kommune,
  RegionCategory,
} from "../features/destination/types";

export type VisitationCategory = {
  key: string;
  labelKey: string;
};

export type StreetSampleRow = {
  street: string;
  bydel: string;
};

export type BackendVisitationData = {
  version: string;
  updatedAt?: string;
  byen: {
    categories: VisitationCategory[];
    map: Record<Bydel, Partial<Record<ByenCategory, HospitalCode>>>;
    streetSample: StreetSampleRow[];
  };
  region: {
    categories: VisitationCategory[];
    map: Partial<
      Record<Kommune, Partial<Record<RegionCategory, HospitalCode>>>
    >;
  };
};

const hospitalCodeSchema = z.enum([
  "AMH",
  "BBH",
  "BOH",
  "FRH",
  "GEH",
  "GLO",
  "HEH",
  "HVH",
  "NOH",
  "NOH_F",
  "RH",
  "UNKNOWN",
  "GLO_RH",
  "RH_GLO",
  "HEH_GEH",
  "AMH_HVH",
  "HGH_RH",
  "GLO_NOH",
  "BBH_FRH",
  "RH_BBH",
  "BBH_RH",
  "BOH_RH",
]);

const byenCategorySchema = z.enum([
  "hospital",
  "medicin",
  "reumatologi",
  "gaskir",
  "neuro_apopleksi",
  "neuro_almen",
  "kardiologi",
  "ortkir",
  "paediatri",
  "gyn",
  "uro",
]);

const regionCategorySchema = z.enum([
  "traumecenter",
  "akutmodtagelse",
  "medicinsk_modtagelse",
  "akutklinik",
  "kirurgi_mave_tarm",
  "boernekirurgi",
  "ortopaedkirurgi",
  "ortopaedkirurgi_boern_u16",
  "karkirurgi",
  "thoraxkirurgi",
  "neurokirurgi",
  "urologi",
  "plastkirurgi",
  "mammakirurgi",
  "kardiologi",
  "lungemedicin",
  "gastroenterologi",
  "endokrinologi",
  "geriatrisk",
  "reumatologi",
  "infektionsmedicin",
  "nefrologi",
  "haematologi",
  "neurologi_ekskl_apopleksi",
  "apopleksi_ekskl_trombolyse",
  "gynaekologi",
  "obstetrik",
  "paediatri",
  "billeddiagnostik",
  "klinisk_onkologi",
  "palliativ_enhed",
  "oftalmologi",
  "oere_naese_hals",
  "audiologi",
  "odontologi",
  "dermato_venerologi",
  "allergologi",
  "arbejds_miljoemedicin",
  "socialmedicin",
]);

const categorySchema = <T extends z.ZodType>(key: T) =>
  z.object({
    key,
    labelKey: z.string().min(1),
  });

const streetSampleSchema = z
  .object({
    street: z.string().min(1),
    bydel: z.string().min(1),
    from: z.number().optional(),
    to: z.number().optional(),
    side: z.enum(["odd", "even"]).optional(),
  })
  .passthrough();

export const visitationDataSchema = z.object({
  version: z.string().min(1),
  updatedAt: z.string().optional(),
  byen: z.object({
    categories: z.array(categorySchema(byenCategorySchema)),
    map: z.record(
      z.string(),
      z.partialRecord(byenCategorySchema, hospitalCodeSchema),
    ),
    streetSample: z.array(streetSampleSchema),
  }),
  region: z.object({
    categories: z.array(categorySchema(regionCategorySchema)),
    map: z.record(
      z.string(),
      z.partialRecord(regionCategorySchema, hospitalCodeSchema),
    ),
  }),
});

export function parseVisitationData(
  value: unknown,
): BackendVisitationData | null {
  const result = visitationDataSchema.safeParse(value);
  return result.success ? (result.data as BackendVisitationData) : null;
}

export type VisitationUpdate = {
  data: BackendVisitationData;
  dataToCache: BackendVisitationData | null;
};

export function resolveVisitationUpdate(
  remote: unknown,
  cached: BackendVisitationData | null,
  local: BackendVisitationData,
): VisitationUpdate {
  const validatedRemote = parseVisitationData(remote);

  if (validatedRemote) {
    return { data: validatedRemote, dataToCache: validatedRemote };
  }

  return { data: cached ?? local, dataToCache: null };
}

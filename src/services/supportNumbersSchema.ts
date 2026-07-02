import { z } from "zod";

export type SupportNumber = {
  id: string;
  nameDa: string;
  nameEn: string;
  phone: string;
  sortOrder?: number;
  active?: boolean;
};

export const supportNumberSchema = z.object({
  id: z.string().min(1),
  nameDa: z.string().min(1),
  nameEn: z.string().min(1),
  phone: z.string().min(1),
  sortOrder: z.number().finite().optional(),
  active: z.boolean().optional(),
});

export const supportNumbersPayloadSchema = z.array(supportNumberSchema);

export function parseSupportNumbersPayload(
  value: unknown,
): SupportNumber[] | null {
  const result = supportNumbersPayloadSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function prepareSupportNumbers(numbers: SupportNumber[]): SupportNumber[] {
  return numbers
    .filter((item) => item.active === true)
    .sort((a, b) => {
      const orderDiff = (a.sortOrder ?? 999) - (b.sortOrder ?? 999);
      if (orderDiff !== 0) return orderDiff;

      return a.nameDa.localeCompare(b.nameDa, "da");
    });
}

export type SupportNumbersUpdate = {
  data: SupportNumber[];
  dataToCache: SupportNumber[] | null;
};

export function resolveSupportNumbersUpdate(
  remote: unknown,
  cached: SupportNumber[] | null,
  bundled: SupportNumber[],
): SupportNumbersUpdate {
  const validatedRemote = parseSupportNumbersPayload(remote);

  if (validatedRemote) {
    return {
      data: prepareSupportNumbers(validatedRemote),
      dataToCache: validatedRemote,
    };
  }

  return {
    data: prepareSupportNumbers(cached ?? bundled),
    dataToCache: null,
  };
}

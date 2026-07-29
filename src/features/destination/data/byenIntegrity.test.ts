import { HOSPITAL_PHONE_FALLBACK } from "../../../data/hospitalNumbersFallback";
import {
  mapStreetBydelToOfficialBydel,
  norm,
  resolveStreetRoute,
} from "../../../domain/destination/routing";
import { BYEN_MAP, STREET_SAMPLE, STREET_SAMPLE_RAW } from "./byen";

function overlaps(a: (typeof STREET_SAMPLE)[number], b: (typeof STREET_SAMPLE)[number]) {
  if (a.side && b.side && a.side !== b.side) return false;
  if (
    a.postalCodes?.length &&
    b.postalCodes?.length &&
    !a.postalCodes.some((code) => b.postalCodes?.includes(code))
  ) {
    return false;
  }
  return (
    Math.max(a.from ?? -Infinity, b.from ?? -Infinity) <=
    Math.min(a.to ?? Infinity, b.to ?? Infinity)
  );
}

describe("Visitation Byen PDF dataset integrity", () => {
  test("no PDF row is silently dropped during district normalisation", () => {
    expect(STREET_SAMPLE).toHaveLength(STREET_SAMPLE_RAW.length);
    for (const row of STREET_SAMPLE) {
      expect(mapStreetBydelToOfficialBydel(row.bydel)).not.toBe("");
    }
  });

  test("constraints and exact rule signatures are valid", () => {
    const signatures = new Set<string>();
    for (const row of STREET_SAMPLE) {
      if (row.from !== undefined && row.to !== undefined) {
        expect(row.from).toBeLessThanOrEqual(row.to);
      }
      expect(row.from === undefined || row.from > 0).toBe(true);
      expect(row.to === undefined || row.to > 0).toBe(true);
      expect(row.side === undefined || ["odd", "even"].includes(row.side)).toBe(true);
      for (const postcode of row.postalCodes ?? []) {
        expect(postcode).toMatch(/^\d{4}$/);
      }
      const signature = JSON.stringify([
        norm(row.street), row.bydel, row.from, row.to, row.side,
        row.postalCodes?.slice().sort(), row.unresolvedReason,
      ]);
      expect(signatures.has(signature)).toBe(false);
      signatures.add(signature);
    }
  });

  test("different destinations never overlap unless explicitly unresolved", () => {
    const grouped = new Map<string, typeof STREET_SAMPLE>();
    for (const row of STREET_SAMPLE) {
      const key = norm(row.street);
      grouped.set(key, [...(grouped.get(key) ?? []), row]);
    }
    for (const rows of grouped.values()) {
      if (rows.some((row) => row.unresolvedReason)) continue;
      for (let left = 0; left < rows.length; left += 1) {
        for (let right = left + 1; right < rows.length; right += 1) {
          if (rows[left].bydel !== rows[right].bydel) {
            expect(overlaps(rows[left], rows[right])).toBe(false);
          }
        }
      }
    }
  });

  test("every structured split requires context and every boundary row resolves", () => {
    const grouped = new Map<string, typeof STREET_SAMPLE>();
    for (const row of STREET_SAMPLE) {
      const key = norm(row.street);
      grouped.set(key, [...(grouped.get(key) ?? []), row]);
    }

    for (const rows of grouped.values()) {
      if (new Set(rows.map((row) => row.bydel)).size < 2) continue;
      const street = rows[0].street;
      expect(resolveStreetRoute(STREET_SAMPLE, street).status).not.toBe("single");

      for (const row of rows) {
        const candidates = [row.from, row.to].filter(
          (value): value is number => value !== undefined,
        );
        if (candidates.length === 0 && row.side) candidates.push(row.side === "even" ? 2 : 1);
        if (candidates.length === 0 && !row.postalCodes?.length) continue;

        for (let number of candidates.length ? candidates : [undefined]) {
          if (number !== undefined && row.side && number % 2 !== (row.side === "odd" ? 1 : 0)) {
            number += 1;
          }
          const result = resolveStreetRoute(
            STREET_SAMPLE,
            street,
            row.side ?? "",
            number,
            row.postalCodes?.[0],
          );
          expect(result).toMatchObject({
            status: "single",
            officialBydel: mapStreetBydelToOfficialBydel(row.bydel),
          });
        }
      }
    }
  });

  test("explicit PDF ambiguities remain explicit and unknown streets fail safely", () => {
    expect(resolveStreetRoute(STREET_SAMPLE, "Drejøgade", "", 35)).toMatchObject({
      status: "still_ambiguous",
    });
    expect(resolveStreetRoute(STREET_SAMPLE, "Sølvgade")).toMatchObject({
      status: "still_ambiguous",
    });
    expect(resolveStreetRoute(STREET_SAMPLE, "Findes Ikke Vej")).toMatchObject({
      status: "not_found",
    });
  });

  test("every Copenhagen destination has bundled contact information", () => {
    const bundledCodes = new Set(
      HOSPITAL_PHONE_FALLBACK.map((item) => item.hospitalCode),
    );
    for (const matrix of Object.values(BYEN_MAP)) {
      for (const code of Object.values(matrix)) {
        if (code !== "UNKNOWN") expect(bundledCodes.has(code)).toBe(true);
      }
    }
  });
});

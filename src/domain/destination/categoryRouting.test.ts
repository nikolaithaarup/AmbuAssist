import {
  BYEN_MAP,
  STREET_SAMPLE,
} from "../../features/destination/data/byen";
import { REGION_BYEN_CATEGORIES } from "../../features/destination/data/regionByen";
import { REGION_MIDT_CATEGORIES } from "../../features/destination/data/regionMidt";
import {
  REGION_NORD_CATEGORIES,
  REGION_NORD_MAP,
} from "../../features/destination/data/regionNord";
import { REGION_SYD_CATEGORIES } from "../../features/destination/data/regionSyd";
import { REGION_SYD_MAP } from "../../features/destination/data/regionSyd";
import { resolveHospitalCode } from "./resolution";
import { deriveAutomaticRoutingStrategy } from "./automaticRouting";
import {
  BYEN_CATEGORY_BY_INTENT,
  getCategoryForArea,
  getIntentForRegionCategory,
} from "./categoryRouting";

describe("Destination category taxonomy and crosswalk", () => {
  test("all regional datasets expose the same complete category taxonomy", () => {
    const keys = (categories: { key: string }[]) =>
      categories.map((item) => item.key);
    expect(keys(REGION_BYEN_CATEGORIES)).toEqual(keys(REGION_MIDT_CATEGORIES));
    expect(keys(REGION_NORD_CATEGORIES)).toEqual(keys(REGION_MIDT_CATEGORIES));
    expect(keys(REGION_SYD_CATEGORIES)).toEqual(keys(REGION_MIDT_CATEGORIES));
    expect(keys(REGION_MIDT_CATEGORIES)).toHaveLength(39);
  });

  test("the same neurology intent uses each source-specific category", () => {
    const cityLocation = deriveAutomaticRoutingStrategy(
      {
        street: "Frederiksberg Allé",
        houseNumber: 13,
        postcode: "1621",
        city: "København V",
      },
      STREET_SAMPLE,
    );
    const regionalLocation = deriveAutomaticRoutingStrategy(
      { street: "Slotsgade", city: "Hillerød", subregion: "Hillerød" },
      STREET_SAMPLE,
    );
    const city = getCategoryForArea(
      "neurologi_ekskl_apopleksi",
      "byen",
    );
    const region = getCategoryForArea(
      "neurologi_ekskl_apopleksi",
      "region",
    );
    expect(city).toEqual({
      available: true,
      area: "byen",
      category: "neuro_almen",
    });
    expect(region).toEqual({
      available: true,
      area: "region",
      category: "neurologi_ekskl_apopleksi",
    });
    if (!city.available || !region.available) throw new Error("mapping missing");
    if (
      cityLocation.area !== "byen" ||
      cityLocation.source !== "street" ||
      cityLocation.route.status !== "single" ||
      regionalLocation.area !== "region"
    ) {
      throw new Error("automatic geography routing did not resolve");
    }
    expect(
      resolveHospitalCode({
        area: "byen",
        bydel: cityLocation.route.officialBydel,
        category: city.category,
        map: BYEN_MAP,
      }),
    ).toBe("GLO");
    expect(
      resolveHospitalCode({
        area: "region",
        kommune: regionalLocation.kommune,
        category: region.category,
        map: REGION_NORD_MAP,
      }),
    ).toBe("NOH");
  });

  test.each([
    ["skadestue", "hospital"],
    ["medicinsk_modtagelse", "medicin"],
    ["kirurgi_mave_tarm", "gaskir"],
    ["apopleksi_ekskl_trombolyse", "neuro_apopleksi"],
    ["ortopaedkirurgi", "ortkir"],
  ] as const)("maps regional intent %s to Byen terminology %s", (intent, expected) => {
    expect(getCategoryForArea(intent, "byen")).toMatchObject({
      available: true,
      category: expected,
    });
  });

  test("exposes Skadestue as the canonical intent without duplicate Akutmodtagelse", () => {
    const intents = REGION_BYEN_CATEGORIES.map((item) =>
      getIntentForRegionCategory(item.key),
    );
    expect(intents).toContain("skadestue");
    expect(intents).not.toContain("akutmodtagelse");
    expect(new Set(intents).size).toBe(intents.length);
  });

  test("Studiestræde keeps injury and medical reception clinically distinct", () => {
    const location = deriveAutomaticRoutingStrategy(
      {
        street: "Studiestræde",
        houseNumber: 10,
        postcode: "1455",
        city: "København K",
      },
      STREET_SAMPLE,
    );
    expect(location).toMatchObject({
      area: "byen",
      route: { status: "single", officialBydel: "Indre by" },
    });
    if (
      location.area !== "byen" ||
      location.source !== "street" ||
      location.route.status !== "single"
    ) {
      throw new Error("Studiestræde did not resolve to a single Byen area");
    }

    const injury = getCategoryForArea("skadestue", "byen");
    const medical = getCategoryForArea("medicinsk_modtagelse", "byen");
    if (!injury.available || !medical.available) {
      throw new Error("Byen acute mappings are missing");
    }
    expect(injury.category).toBe("hospital");
    expect(medical.category).toBe("medicin");
    expect(
      resolveHospitalCode({
        area: "byen",
        bydel: location.route.officialBydel,
        category: injury.category,
        map: BYEN_MAP,
      }),
    ).toBe("RH");
    expect(
      resolveHospitalCode({
        area: "byen",
        bydel: location.route.officialBydel,
        category: medical.category,
        map: BYEN_MAP,
      }),
    ).toBe("BBH");
  });

  test("regional acute intents stay separate even when Hvidovre resolves both to HVH", () => {
    const injury = getCategoryForArea("skadestue", "region");
    const medical = getCategoryForArea("medicinsk_modtagelse", "region");
    expect(injury.category).toBe("akutmodtagelse");
    expect(medical.category).toBe("medicinsk_modtagelse");
    expect(
      resolveHospitalCode({
        area: "region",
        kommune: "Hvidovre",
        category: injury.category,
        map: REGION_SYD_MAP,
      }),
    ).toBe("HVH");
    expect(
      resolveHospitalCode({
        area: "region",
        kommune: "Hvidovre",
        category: medical.category,
        map: REGION_SYD_MAP,
      }),
    ).toBe("HVH");
  });

  test("regional-only terminology fails explicitly in Byen", () => {
    expect(getCategoryForArea("traumecenter", "region")).toEqual({
      available: true,
      area: "region",
      category: "traumecenter",
    });
    expect(getCategoryForArea("traumecenter", "byen")).toEqual({
      available: false,
      area: "byen",
      intent: "traumecenter",
    });
    expect(BYEN_CATEGORY_BY_INTENT.traumecenter).toBeUndefined();
  });
});

import { BYEN_MAP, STREET_SAMPLE } from "../../features/destination/data/byen";
import { REGION_NORD_MAP } from "../../features/destination/data/regionNord";
import { resolveHospitalCode } from "./resolution";
import {
  deriveAutomaticRoutingStrategy,
  getByenCategory,
  getCanonicalRoutingRows,
  getConfidenceUx,
  matchManualLocation,
} from "./automaticRouting";
import type { Kommune } from "./types";

const municipalities = Object.keys(REGION_NORD_MAP) as Kommune[];

describe("automatic Destination routing strategy", () => {
  test("GPS selects Copenhagen street routing without a mode choice", () => {
    const strategy = deriveAutomaticRoutingStrategy(
      {
        street: "Frederiksberg Allé",
        houseNumber: 13,
        postcode: "1621",
        city: "København V",
      },
      STREET_SAMPLE,
    );
    expect(strategy).toMatchObject({
      area: "byen",
      route: { status: "single", officialBydel: "Vesterbro" },
    });
  });

  test("GPS selects municipality routing outside Copenhagen", () => {
    expect(
      deriveAutomaticRoutingStrategy(
        { street: "Slotsgade", city: "Hillerød", subregion: "Hillerød" },
        STREET_SAMPLE,
      ),
    ).toEqual({ area: "region", kommune: "Hillerød" });
  });

  test("manual input selects Copenhagen routing and preserves 13A", () => {
    const match = matchManualLocation(
      "Frederiksberg Allé 13A, 1621 København V",
      STREET_SAMPLE,
      municipalities,
    );
    expect(match).toMatchObject({
      area: "byen",
      displayedHouseNumber: "13A",
      route: { status: "single", officialBydel: "Vesterbro" },
    });
  });

  test("a selected legacy range label does not invent a patient house number", () => {
    const rows = [
      {
        street: "Frederiksberg Allé (Nr. 1–13B)",
        bydel: "Vesterbro",
        from: 1,
        to: 13,
        side: "odd" as const,
      },
    ];

    expect(
      matchManualLocation(
        "Frederiksberg Allé (Nr. 1–13B)",
        rows,
        municipalities,
      ),
    ).toMatchObject({
      area: "byen",
      street: "Frederiksberg Allé",
      displayedHouseNumber: "",
      route: { status: "single" },
    });

    expect(getCanonicalRoutingRows(rows, STREET_SAMPLE)).toBe(STREET_SAMPLE);
  });

  test("manual input selects municipality routing outside Copenhagen", () => {
    expect(
      matchManualLocation(
        "Slotsgade 10, Hillerød",
        STREET_SAMPLE,
        municipalities,
      ),
    ).toEqual({ area: "region", kommune: "Hillerød" });
  });

  test("keeps missing house number and ambiguous streets unresolved", () => {
    expect(
      matchManualLocation(
        "Frederiksberg Allé",
        STREET_SAMPLE,
        municipalities,
      ),
    ).toMatchObject({
      area: "byen",
      route: { status: "needs_house_number" },
    });
    const ambiguousRows = [
      { street: "Testvej", bydel: "Valby", side: "odd" as const },
      { street: "Testvej", bydel: "Vanløse", side: "even" as const },
    ];
    expect(
      matchManualLocation("Testvej", ambiguousRows, municipalities),
    ).toMatchObject({ area: "byen", route: { status: "needs_side" } });
  });

  test("unknown Copenhagen streets fail safely instead of becoming region routes", () => {
    expect(
      deriveAutomaticRoutingStrategy(
        { street: "Ukendtvej", postcode: "2000", city: "Frederiksberg" },
        STREET_SAMPLE,
      ),
    ).toEqual({ area: "unresolved", reason: "unknown_city_street" });
    expect(
      matchManualLocation("Ukendtvej 12", STREET_SAMPLE, municipalities),
    ).toEqual({ area: "unresolved" });
  });

  test("maps the explicit category correctly in both routing systems", () => {
    const cityCategory = getByenCategory("skadestue");
    expect(cityCategory).toBe("hospital");
    expect(
      resolveHospitalCode({
        area: "byen",
        bydel: "Vesterbro",
        category: cityCategory!,
        map: BYEN_MAP,
      }),
    ).toBe("HVH");
    expect(
      resolveHospitalCode({
        area: "region",
        kommune: "Hillerød",
        category: "akutmodtagelse",
        map: REGION_NORD_MAP,
      }),
    ).toBe("NOH");
  });

  test("changing address and category recalculates the destination", () => {
    const cityCategory = getByenCategory("skadestue")!;
    expect(
      resolveHospitalCode({
        area: "byen",
        bydel: "Vesterbro",
        category: cityCategory,
        map: BYEN_MAP,
      }),
    ).toBe("HVH");
    expect(
      resolveHospitalCode({
        area: "byen",
        bydel: "Indre by",
        category: cityCategory,
        map: BYEN_MAP,
      }),
    ).toBe("RH");
    expect(getByenCategory("kardiologi")).toBe("kardiologi");
    expect(
      resolveHospitalCode({
        area: "byen",
        bydel: "Indre by",
        category: "kardiologi",
        map: BYEN_MAP,
      }),
    ).toBe("BBH");
  });

  test.each([
    ["high", "result"],
    ["medium", "confirm"],
    ["poor", "recovery"],
  ] as const)(
    "maps %s confidence to the expected UX",
    (confidence, expected) => {
      expect(getConfidenceUx(confidence)).toBe(expected);
    },
  );
});

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
const AMAGER_BYDEL = "Amager (2300, 2770 og 2791)";

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

  test.each([
    [
      "2300 København S",
      {
        street: "Amagerbrogade",
        postcode: "2300",
        city: "København S",
      },
    ],
    [
      "Sundby",
      {
        street: "Amagerbrogade",
        postcode: "2300",
        city: "København S",
        district: "Sundby",
      },
    ],
    [
      "Sundbyøster",
      {
        street: "Amagerbrogade",
        postcode: "2300",
        city: "København S",
        district: "Sundbyøster",
      },
    ],
    [
      "Amagerbro",
      {
        street: "Amagerbrogade",
        postcode: "2300",
        city: "København S",
        district: "Amagerbro",
      },
    ],
    [
      "Ørestad",
      {
        street: "Ørestads Boulevard",
        postcode: "2300",
        city: "København S",
        district: "Ørestad",
      },
    ],
    [
      "Orestad",
      {
        street: "Orestads Boulevard",
        postcode: "2300",
        city: "Kobenhavn S",
        district: "Orestad",
      },
    ],
    [
      "2770 Kastrup",
      {
        street: "Kastruplundgade",
        postcode: "2770",
        city: "Kastrup",
      },
    ],
    [
      "2770 Tårnby",
      {
        street: "Tårnbyvej",
        postcode: "2770",
        city: "Kastrup",
        district: "Tårnby",
      },
    ],
    [
      "2770 Tarnby",
      {
        street: "Tarnbyvej",
        postcode: "2770",
        city: "Kastrup",
        district: "Tarnby",
      },
    ],
    [
      "2791 Dragør",
      {
        street: "Kirkevej",
        postcode: "2791",
        city: "Dragør",
      },
    ],
    [
      "2791 Dragor",
      {
        street: "Kirkevej",
        postcode: "2791",
        city: "Dragor",
      },
    ],
  ] as const)("uses the explicit Amager postal fallback for %s", (_label, address) => {
    expect(deriveAutomaticRoutingStrategy(address, STREET_SAMPLE)).toEqual({
      area: "byen",
      source: "postal_district_fallback",
      street: address.street,
      postcode: address.postcode,
      officialBydel: AMAGER_BYDEL,
    });
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

  test("does not apply the Amager fallback to 2450 København SV", () => {
    expect(
      deriveAutomaticRoutingStrategy(
        {
          street: "Sluseholmen",
          postcode: "2450",
          city: "København SV",
          district: "Sydhavnen",
        },
        STREET_SAMPLE,
      ),
    ).toEqual({ area: "unresolved", reason: "unknown_city_street" });
  });

  test("known street routing takes precedence over the Amager postal fallback", () => {
    expect(
      deriveAutomaticRoutingStrategy(
        {
          street: "Known Amager Street",
          houseNumber: 10,
          postcode: "2300",
          city: "København S",
        },
        [{ street: "Known Amager Street", bydel: "Christianshavn" }],
      ),
    ).toMatchObject({
      area: "byen",
      source: "street",
      route: { status: "single", officialBydel: "Christianshavn" },
    });
  });

  test("Amager fallback does not override parity ambiguity", () => {
    const rows = [
      { street: "Splitvej", bydel: "Valby", side: "odd" as const },
      { street: "Splitvej", bydel: "Vanløse", side: "even" as const },
    ];
    expect(
      deriveAutomaticRoutingStrategy(
        {
          street: "Splitvej",
          postcode: "2300",
          city: "København S",
        },
        rows,
      ),
    ).toMatchObject({
      area: "byen",
      source: "street",
      route: { status: "needs_side" },
    });
  });

  test("Amager fallback does not override unresolved street-table ambiguity", () => {
    const rows = [
      { street: "Ambiguousvej", bydel: "Valby" },
      { street: "Ambiguousvej", bydel: "Vanløse" },
    ];
    expect(
      deriveAutomaticRoutingStrategy(
        {
          street: "Ambiguousvej",
          postcode: "2300",
          city: "København S",
        },
        rows,
      ),
    ).toMatchObject({
      area: "byen",
      source: "street",
      route: { status: "still_ambiguous" },
    });
  });

  test("Amager fallback does not override a required house number", () => {
    const rows = [
      { street: "Rangevej", bydel: "Valby", from: 1, to: 49 },
      { street: "Rangevej", bydel: "Vanløse", from: 50 },
    ];
    expect(
      deriveAutomaticRoutingStrategy(
        {
          street: "Rangevej",
          postcode: "2300",
          city: "København S",
        },
        rows,
      ),
    ).toMatchObject({
      area: "byen",
      source: "street",
      route: { status: "needs_house_number" },
    });
  });

  test("postal ambiguity still requires a postal code", () => {
    const rows = [
      { street: "Postalvej", bydel: "Bispebjerg", postalCodes: ["2400"] },
      {
        street: "Postalvej",
        bydel: "Brønshøj/Husum",
        postalCodes: ["2700"],
      },
    ];
    expect(
      deriveAutomaticRoutingStrategy(
        {
          street: "Postalvej",
          city: "København S",
        },
        rows,
      ),
    ).toMatchObject({
      area: "byen",
      source: "street",
      route: { status: "needs_postal_code" },
    });
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

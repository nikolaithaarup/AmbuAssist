import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { Text, TextInput } from "react-native";
import DestinationTool from "../../../app/tools/destination";

const mockHasServicesEnabled = jest.fn();
const mockGetPermissions = jest.fn();
const mockGetCurrentPosition = jest.fn();
const mockGetLastKnownPosition = jest.fn();
const mockReverseGeocode = jest.fn();
const mockSetSettings = jest.fn();
let mockSettings = {
  language: "da",
  destinationCategoryFavourites: null,
};
const mountedRenderers = [];

jest.mock("expo-location", () => ({
  Accuracy: { Balanced: 3 },
  hasServicesEnabledAsync: (...args) => mockHasServicesEnabled(...args),
  getForegroundPermissionsAsync: (...args) => mockGetPermissions(...args),
  requestForegroundPermissionsAsync: (...args) => mockGetPermissions(...args),
  getCurrentPositionAsync: (...args) => mockGetCurrentPosition(...args),
  getLastKnownPositionAsync: (...args) => mockGetLastKnownPosition(...args),
  reverseGeocodeAsync: (...args) => mockReverseGeocode(...args),
  enableNetworkProviderAsync: jest.fn(),
}));

jest.mock("../../i18n/useT", () => {
  const { da } = jest.requireActual("../../i18n/strings");
  return { useT: () => ({ lang: "da", t: (key) => da[key] ?? key }) };
});

jest.mock("../../state/settings", () => ({
  useSettings: () => ({ settings: mockSettings, setSettings: mockSetSettings }),
}));

jest.mock("../../services/referenceService", () => ({
  getReference: jest.fn().mockResolvedValue(null),
}));

jest.mock("../../services/visitationService", () => {
  const {
    BYEN_CATEGORIES,
    BYEN_MAP,
    STREET_SAMPLE,
  } = jest.requireActual("./data/byen");
  const { REGION_BYEN_MAP } = jest.requireActual("./data/regionByen");
  const { REGION_MIDT_MAP } = jest.requireActual("./data/regionMidt");
  const { REGION_NORD_MAP } = jest.requireActual("./data/regionNord");
  const { REGION_SYD_MAP } = jest.requireActual("./data/regionSyd");
  const data = {
    version: "test",
    byen: {
      categories: BYEN_CATEGORIES,
      map: BYEN_MAP,
      streetSample: STREET_SAMPLE,
    },
    region: {
      categories: [],
      map: {
        ...REGION_BYEN_MAP,
        ...REGION_MIDT_MAP,
        ...REGION_NORD_MAP,
        ...REGION_SYD_MAP,
      },
    },
  };
  return {
    LOCAL_VISITATION_DATA: data,
    loadVisitationData: jest.fn().mockResolvedValue(data),
  };
});

jest.mock("../../dev/hospitalNumbers", () => ({
  getHospitalPhoneNumbersByCode: jest.fn().mockResolvedValue([]),
  hospitalLabel: (_translate, code) => code,
}));

function location(accuracy = 20) {
  return {
    timestamp: Date.now(),
    coords: { latitude: 55.67, longitude: 12.55, accuracy },
  };
}

function renderedText(root) {
  return root
    .findAllByType(Text)
    .flatMap((node) => node.props.children)
    .filter((child) => typeof child === "string")
    .join(" ");
}

async function renderTool() {
  let renderer;
  await act(async () => {
    renderer = TestRenderer.create(<DestinationTool />);
    await Promise.resolve();
  });
  mountedRenderers.push(renderer);
  return renderer;
}

async function pressGps(root) {
  const container = root.findByProps({ testID: "destination-primary-gps" });
  const button = container.find(
    (node) => typeof node.props.onPress === "function",
  );
  await act(async () => {
    await button.props.onPress();
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("DestinationTool simplified entry flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSettings = {
      language: "da",
      destinationCategoryFavourites: null,
    };
    mockHasServicesEnabled.mockResolvedValue(true);
    mockGetPermissions.mockResolvedValue({ granted: true });
    mockGetCurrentPosition.mockResolvedValue(location());
    mockGetLastKnownPosition.mockResolvedValue(null);
    mockReverseGeocode.mockResolvedValue([]);
  });

  afterEach(async () => {
    await act(async () => {
      await Promise.resolve();
      mountedRenderers.splice(0).forEach((renderer) => renderer.unmount());
    });
  });

  test("starts with category, GPS, manual address and fallback—without area modes or an empty result", async () => {
    const renderer = await renderTool();
    const root = renderer.root;
    const text = renderedText(root);

    expect(text).toContain("Visitationstype");
    expect(text).toContain("Find destination med GPS");
    expect(text).toContain("Søg adresse manuelt");
    expect(text).toContain("Vælg hospital manuelt");
    expect(text).not.toContain("Byen");
    expect(text).not.toContain("Regionen");
    expect(root.findAllByProps({ testID: "destination-result" })).toHaveLength(0);

    act(() => {
      root
        .findByProps({ testID: "destination-manual-hospital-toggle" })
        .props.onPress();
    });
    expect(renderedText(root)).toContain("Hospital");
  });

  test("GPS automatically routes a high-confidence Copenhagen address", async () => {
    mockReverseGeocode.mockResolvedValue([
      {
        street: "Frederiksberg Allé",
        streetNumber: "13A",
        name: "Frederiksberg Allé",
        postalCode: "1621",
        city: "København V",
        district: "Vesterbro",
        subregion: "København",
        region: "Region Hovedstaden",
        formattedAddress: null,
      },
    ]);
    const renderer = await renderTool();
    await pressGps(renderer.root);

    expect(renderer.root.findAllByProps({ testID: "destination-result" }).length).toBeGreaterThan(0);
    expect(renderedText(renderer.root)).toContain("HVH");
    expect(renderedText(renderer.root)).not.toContain("GPS-præcision");
  });

  test("GPS does not infer a house number from an iOS placemark name when streetNumber is null", async () => {
    mockReverseGeocode.mockResolvedValue([
      {
        street: "Frederiksberg Allé",
        streetNumber: null,
        name: "Frederiksberg Allé 13A",
        postalCode: "1621",
        city: "København V",
        district: "Vesterbro",
        subregion: "København",
        region: "Region Hovedstaden",
        formattedAddress: null,
      },
    ]);
    const renderer = await renderTool();
    await pressGps(renderer.root);

    expect(renderer.root.findAllByProps({ testID: "destination-result" })).toHaveLength(0);
    expect(renderedText(renderer.root)).toContain("Indtast husnummeret");
  });

  test.each([
    [
      "2300 København S",
      {
        street: "Amagerbrogade",
        name: "100",
        postalCode: "2300",
        city: "København S",
        district: "Sundbyøster",
        subregion: "København",
        region: "Region Hovedstaden",
        formattedAddress: "Amagerbrogade 100, 2300 København S",
      },
    ],
    [
      "2770 Kastrup",
      {
        street: "Kastruplundgade",
        name: "15",
        postalCode: "2770",
        city: "Kastrup",
        district: "Tårnby",
        subregion: "Tårnby",
        region: "Region Hovedstaden",
        formattedAddress: "Kastruplundgade 15, 2770 Kastrup",
      },
    ],
    [
      "2791 Dragør",
      {
        street: "Kirkevej",
        name: "2",
        postalCode: "2791",
        city: "Dragør",
        district: "Dragør",
        subregion: "Dragør",
        region: "Region Hovedstaden",
        formattedAddress: "Kirkevej 2, 2791 Dragør",
      },
    ],
  ])(
    "GPS routes an unmatched Amager street in %s through the postal district matrix",
    async (_label, reverseGeocodeAddress) => {
      mockReverseGeocode.mockResolvedValue([reverseGeocodeAddress]);
      const renderer = await renderTool();
      await pressGps(renderer.root);

      expect(
        renderer.root.findAllByProps({ testID: "destination-result" }).length,
      ).toBeGreaterThan(0);
      expect(renderedText(renderer.root)).toContain("AMH");
      expect(renderedText(renderer.root)).toContain(
        "Amager (2300, 2770 og 2791)",
      );
    },
  );

  test("category picker shows default favourites separately and persists a toggle", async () => {
    const renderer = await renderTool();
    const root = renderer.root;
    act(() => {
      root
        .findByProps({ testID: "destination-all-categories-toggle" })
        .props.onPress();
    });

    const text = renderedText(root);
    expect(text).toContain("Favoritter");
    expect(text).toContain("Alle visitationer");
    expect(text).toContain("Medicinsk modtagelse");
    expect(text).toContain("Neurologi");
    expect(text).toContain("Pædiatri");
    expect(text).toContain("Gynækologi");
    expect(text).toContain("Obstetrik");
    expect(text).toContain("Øre-næse-hals");
    expect(text).not.toContain("Akutmodtagelse");

    act(() => {
      root
        .findByProps({
          testID: "destination-category-favourite-gynaekologi",
        })
        .props.onPress();
    });
    const update = mockSetSettings.mock.calls.at(-1)[0];
    expect(update(mockSettings).destinationCategoryFavourites).toEqual([
      "skadestue",
      "medicinsk_modtagelse",
      "neurologi_ekskl_apopleksi",
      "paediatri",
      "obstetrik",
      "oere_naese_hals",
    ]);
  });

  test("an intentionally empty favourite list omits the favourites section", async () => {
    mockSettings = {
      language: "da",
      destinationCategoryFavourites: [],
    };
    const renderer = await renderTool();
    expect(renderedText(renderer.root)).not.toContain("Favoritter");
    expect(renderedText(renderer.root)).toContain("Alle visitationer");
    act(() => {
      renderer.root
        .findByProps({ testID: "destination-all-categories-toggle" })
        .props.onPress();
    });
    expect(renderedText(renderer.root)).not.toContain("Favoritter");
    expect(renderedText(renderer.root)).toContain("Kardiologi");
  });

  test("selects a favourite category directly from its compact chip", async () => {
    const renderer = await renderTool();
    const root = renderer.root;

    act(() => {
      root
        .findByProps({
          testID:
            "destination-favourite-category-neurologi_ekskl_apopleksi",
        })
        .props.onPress();
    });

    expect(
      root.findByProps({
        testID: "destination-favourite-category-neurologi_ekskl_apopleksi",
      }).props.accessibilityState,
    ).toEqual({ selected: true });
  });

  test("searches all categories and closes the sheet after selection", async () => {
    const renderer = await renderTool();
    const root = renderer.root;

    act(() => {
      root
        .findByProps({ testID: "destination-all-categories-toggle" })
        .props.onPress();
    });
    expect(
      root.findByProps({ testID: "destination-all-categories-toggle" }).props
        .accessibilityState,
    ).toEqual({ expanded: true });

    act(() => {
      root
        .findByProps({ testID: "destination-category-search" })
        .props.onChangeText("kardio");
    });
    expect(renderedText(root)).toContain("Kardiologi");
    expect(
      root.findAllByProps({
        testID: "destination-category-option-traumecenter",
      }),
    ).toHaveLength(0);

    act(() => {
      root
        .findByProps({ testID: "destination-category-option-kardiologi" })
        .props.onPress();
    });
    expect(
      root.findByProps({ testID: "destination-all-categories-toggle" }).props
        .accessibilityState,
    ).toEqual({ expanded: false });
    expect(
      root
        .findAllByProps({ accessibilityLabel: "Kardiologi" })
        .some((node) => node.props.accessibilityState?.selected === true),
    ).toBe(true);
  });

  test("a regional-only category fails explicitly after Copenhagen routing", async () => {
    mockReverseGeocode.mockResolvedValue([
      {
        street: "Frederiksberg Allé",
        name: "13A",
        postalCode: "1621",
        city: "København V",
        district: "Vesterbro",
        subregion: "København",
        formattedAddress: "Frederiksberg Allé 13A, 1621 København V",
      },
    ]);
    const renderer = await renderTool();
    const root = renderer.root;
    act(() => {
      root
        .findByProps({ testID: "destination-all-categories-toggle" })
        .props.onPress();
    });
    act(() => {
      root
        .findByProps({ testID: "destination-category-option-traumecenter" })
        .props.onPress();
    });
    await pressGps(root);

    expect(
      root.findAllByProps({ testID: "destination-category-unavailable" }).length,
    ).toBeGreaterThan(0);
    expect(renderedText(root)).toContain(
      "findes ikke i routingtabellen for den fundne placering",
    );
    expect(root.findAllByProps({ testID: "destination-result" })).toHaveLength(0);
  });

  test("favourite status does not alter automatic routing", async () => {
    mockSettings = {
      language: "da",
      destinationCategoryFavourites: [],
    };
    mockReverseGeocode.mockResolvedValue([
      {
        street: "Frederiksberg Allé",
        name: "13A",
        postalCode: "1621",
        city: "København V",
        district: "Vesterbro",
        subregion: "København",
        formattedAddress: "Frederiksberg Allé 13A, 1621 København V",
      },
    ]);
    const renderer = await renderTool();
    await pressGps(renderer.root);
    expect(renderedText(renderer.root)).toContain("HVH");
    expect(
      renderer.root.findAllByProps({ testID: "destination-result" }).length,
    ).toBeGreaterThan(0);
  });

  test("GPS automatically routes an address outside Copenhagen", async () => {
    mockReverseGeocode.mockResolvedValue([
      {
        street: "Slotsgade",
        name: "10",
        postalCode: "3400",
        city: "Hillerød",
        district: "Hillerød",
        subregion: "Hillerød",
        region: "Region Hovedstaden",
        formattedAddress: "Slotsgade 10, 3400 Hillerød",
      },
    ]);
    const renderer = await renderTool();
    await pressGps(renderer.root);

    expect(renderer.root.findAllByProps({ testID: "destination-result" }).length).toBeGreaterThan(0);
    expect(renderedText(renderer.root)).toContain("NOH");
  });

  test("medium confidence requires confirmation before showing a destination", async () => {
    mockGetCurrentPosition.mockResolvedValue(location(60));
    mockReverseGeocode.mockResolvedValue([
      {
        street: "Frederiksberg Allé",
        name: "13A",
        postalCode: "1621",
        city: "København V",
        district: "Vesterbro",
        subregion: "København",
        formattedAddress: "Frederiksberg Allé 13A, 1621 København V",
      },
    ]);
    const renderer = await renderTool();
    await pressGps(renderer.root);

    expect(renderedText(renderer.root)).toContain("Kontrollér den fundne adresse");
    expect(renderer.root.findAllByProps({ testID: "destination-result" })).toHaveLength(0);

    const confirmContainer = renderer.root.findByProps({
      testID: "destination-confirm-address",
    });
    const confirmButton = confirmContainer.find(
      (node) => typeof node.props.onPress === "function",
    );
    await act(async () => {
      confirmButton.props.onPress();
      await Promise.resolve();
    });
    expect(
      renderer.root.findAllByProps({ testID: "destination-result" }).length,
    ).toBeGreaterThan(0);
  });

  test("poor confidence offers recovery and no automatic result", async () => {
    mockGetCurrentPosition.mockResolvedValue(location(101));
    const renderer = await renderTool();
    await pressGps(renderer.root);

    expect(renderer.root.findAllByProps({ testID: "destination-result" })).toHaveLength(0);
    expect(renderedText(renderer.root)).toContain("Prøv GPS igen");
    expect(renderedText(renderer.root)).toContain("Søg adresse manuelt");
    expect(renderedText(renderer.root)).toContain("Vælg hospital manuelt");
  });

  test.each([
    ["Frederiksberg Allé 13A, 1621 København V", "HVH"],
    ["Slotsgade 10, Hillerød", "NOH"],
  ])("manual location %s routes automatically", async (input, hospital) => {
    const renderer = await renderTool();
    const root = renderer.root;
    act(() => {
      root
        .findByProps({ testID: "destination-manual-hospital-toggle" });
      const manualToggle = root
        .findAllByProps({ testID: "destination-manual-address-toggle" })
        .find((node) => typeof node.props.onPress === "function");
      manualToggle.props.onPress();
    });
    const addressInput = root.findByType(TextInput);
    await act(async () => {
      addressInput.props.onChangeText(input);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(renderedText(root)).toContain(hospital);
    expect(root.findAllByProps({ testID: "destination-result" }).length).toBeGreaterThan(0);
  });
});

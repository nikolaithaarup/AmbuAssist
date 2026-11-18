import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { Pressable, Text, View } from "react-native";

const mockPush = jest.fn();
const mockSetLanguage = jest.fn();
let mockWidth = 390;

const ReactNative = require("react-native");
const originalPlatform = ReactNative.Platform.OS;
jest
  .spyOn(ReactNative, "useWindowDimensions")
  .mockImplementation(() => ({ width: mockWidth, height: 844 }));

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("../../state/settings", () => ({
  useSettings: () => ({
    settings: { language: "da" },
    setLanguage: mockSetLanguage,
  }),
}));

jest.mock("../../state/favourites", () => ({
  useFavourites: () => ({
    favourites: [],
    isFavourite: () => false,
    toggleFavourite: jest.fn(),
  }),
}));

jest.mock("../../i18n/useT", () => ({
  useT: () => ({ t: (key) => key }),
}));

jest.mock("../../ui/haptics", () => ({
  hapticFavourite: jest.fn(),
  hapticToolOpen: jest.fn(),
}));

jest.mock("../../ui/Background", () => {
  const { View: MockView } = require("react-native");
  return {
    Background: ({ children }) => <MockView>{children}</MockView>,
  };
});

jest.mock("../../ui/Ui", () => {
  const { Text: MockText, View: MockView } = require("react-native");
  return {
    Screen: ({ children, ...props }) => (
      <MockView testID="home-screen" {...props}>{children}</MockView>
    ),
    Subtle: ({ children }) => <MockText>{children}</MockText>,
    Title: ({ children }) => <MockText>{children}</MockText>,
  };
});

jest.mock("../../ui/NavigationCard", () => {
  const { View: MockView } = require("react-native");
  return {
    NavigationCard: (props) => (
      <MockView testID="navigation-card" {...props} />
    ),
  };
});

const Home = require("../../../app/home").default;

describe("Home responsive mobile layout", () => {
  let renderer;

  beforeEach(() => {
    mockWidth = 390;
    jest.clearAllMocks();
  });

  afterEach(() => {
    act(() => renderer?.unmount());
    ReactNative.Platform.OS = originalPlatform;
  });

  function renderHome() {
    act(() => {
      renderer = TestRenderer.create(<Home />);
    });
    return renderer.root;
  }

  test("keeps the mobile header compact and tools free of descriptions", () => {
    const root = renderHome();

    expect(root.findByProps({ testID: "home-screen" }).props.edges).toEqual([
      "top",
      "left",
      "right",
      "bottom",
    ]);
    expect(
      root.findAllByProps({ testID: "navigation-card" }).every(
        (card) => card.props.description === undefined,
      ),
    ).toBe(true);
    expect(root.findAllByType(Text).some((node) => node.props.children === "homeTagline")).toBe(false);
  });

  test("keeps desktop tool rows compact and uses the built-in language selector", () => {
    mockWidth = 1024;
    const root = renderHome();

    expect(
      root.findAllByProps({ testID: "navigation-card" }).some(
        (card) => card.props.description === undefined && card.props.compact === true,
      ),
    ).toBe(true);
    const danish = root.findAll((node) =>
      node.props.accessibilityLabel === "Dansk" &&
      typeof node.props.onPress === "function" &&
      node.props.accessibilityState?.selected === true,
    )[0];
    expect(danish).toBeDefined();
    act(() => danish?.props.onPress());
    expect(mockSetLanguage).toHaveBeenCalledWith("da");
  });

  test("matches FlashMedic: small accent section labels and compact header controls", () => {
    ReactNative.Platform.OS = "web";
    const root = renderHome();
    const headings = root.findAllByProps({ testID: "home-section-header" });
    expect(headings.filter((node) => node.type === View)).toHaveLength(2);
    const toolsHeading = root.findAllByType(Text).find((node) => node.props.children === "Værktøjer");
    expect(toolsHeading).toBeDefined();
    expect(toolsHeading.props.style.color).toBe(require("../../ui/theme").theme.colors.headingAccent);
    expect(toolsHeading.props.style.textTransform).toBe("uppercase");
    expect(root.findByProps({ testID: "home-language-controls" }).props.style.position).toBe("absolute");
    const mark = root.findByProps({ testID: "home-brand-icon" });
    expect(mark.props.style.height).toBe(56);
    const wordmark = root.findByProps({ testID: "home-brand-wordmark" });
    expect(wordmark.props.style.height).toBe(38);
  });

  test("centres PWA menu at a shared width measured from its longest title", () => {
    ReactNative.Platform.OS = "web";
    const root = renderHome();
    const menu = root.findByProps({ testID: "ambu-home-menu" });
    const probes = root.findByProps({ testID: "ambu-home-label-measure" }).findAllByType(Text);

    expect(menu.props.style.width).toBe(316);
    act(() => {
      probes.forEach((probe) =>
        probe.props.onLayout({ nativeEvent: { layout: { width: 150 } } }),
      );
    });
    expect(root.findByProps({ testID: "ambu-home-menu" }).props.style.width).toBe(296);

    act(() => {
      probes[0].props.onLayout({ nativeEvent: { layout: { width: 194 } } });
    });
    expect(root.findByProps({ testID: "ambu-home-menu" }).props.style.width).toBe(312);
    expect(root.findByProps({ testID: "ambu-home-menu" }).props.style.alignSelf).toBe("center");
  });

  test("uses the balanced branded hero and title-only cards in the web PWA", () => {
    ReactNative.Platform.OS = "web";
    const root = renderHome();

    const hero = root.findByProps({ testID: "home-hero" });
    expect(hero.props.style.borderWidth).toBeUndefined();
    expect(hero.props.style.backgroundColor).toBeUndefined();
    expect(root.findAllByProps({ testID: "navigation-card" }).every(card => card.props.compact === true)).toBe(true);
    const scroll = root.findByProps({ testID: "home-scroll" });
    expect(scroll.props.contentContainerStyle.paddingBottom).toBe(6);
    expect(scroll.findAllByProps({ testID: "home-hero" }).length).toBeGreaterThan(0);
    expect(
      root.findAllByType(Text).some(
        (node) => node.props.children === "homeTagline",
      ),
    ).toBe(true);
    expect(
      root.findAllByProps({ testID: "navigation-card" }).every(
        (card) => card.props.description === undefined,
      ),
    ).toBe(true);
  });
});

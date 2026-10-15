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

  test("keeps descriptions on desktop and uses the built-in language selector", () => {
    mockWidth = 1024;
    const root = renderHome();

    expect(
      root.findAllByProps({ testID: "navigation-card" }).some(
        (card) => typeof card.props.description === "string",
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

  test("uses the balanced branded hero and title-only cards in the web PWA", () => {
    ReactNative.Platform.OS = "web";
    const root = renderHome();

    expect(root.findByProps({ testID: "home-hero" })).toBeDefined();
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

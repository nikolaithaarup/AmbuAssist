import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { Animated, Text } from "react-native";
import { AboutSupportScreen } from "./AboutSupportScreen.web";

const mockUseReducedMotionPreference = jest.fn(() => false);

jest.mock("../../i18n/useT", () => {
  const { da } = jest.requireActual("../../i18n/strings");
  return { useT: () => ({ lang: "da", t: (key) => da[key] ?? key }) };
});

jest.mock("../../ui/motion", () => ({
  usePressFeedback: () => ({
    animatedStyle: {},
    onPressIn: jest.fn(),
    onPressOut: jest.fn(),
  }),
  useReducedMotionPreference: (...args) => mockUseReducedMotionPreference(...args),
}));

function textContent(root) {
  return root
    .findAllByType(Text)
    .flatMap((node) => node.props.children)
    .filter((child) => typeof child === "string")
    .join(" ");
}

describe("AboutSupportScreen web experience", () => {
  beforeAll(() => {
    jest.spyOn(Animated, "timing").mockImplementation(() => ({
      start: (callback) => callback?.({ finished: true }),
      stop: jest.fn(),
      reset: jest.fn(),
    }));
  });

  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => mockUseReducedMotionPreference.mockReturnValue(false));

  test("keeps product identity and critical safety information visible", () => {
    let renderer;
    act(() => {
      renderer = TestRenderer.create(<AboutSupportScreen />);
    });

    const copy = textContent(renderer.root);
    expect(renderer.root.findAllByProps({ testID: "about-product-identity" }).length).toBeGreaterThan(0);
    expect(copy).toContain("Små værktøjer til kaotisk virkelighed");
    expect(copy).toContain("lad aldrig brug af appen forsinke nødvendig behandling");
    expect(copy).toContain("Udviklet af SynapseStudio");
    expect(copy).not.toContain("Tilsigtet brug");
    expect(copy).not.toContain("nikolai_91@live.com");
    expect(copy).not.toContain("Grundlæggende brug af appen og værktøjerne kan registreres");
  });

  test("presents the optional guide with both platform instructions", () => {
    let renderer;
    act(() => {
      renderer = TestRenderer.create(<AboutSupportScreen />);
    });

    expect(renderer.root.findAllByProps({ testID: "about-install-guide" })).toHaveLength(0);
    const toggle = renderer.root.findByProps({ testID: "about-install-toggle" });
    act(() => toggle.props.onPress());
    expect(renderer.root.findAllByProps({ testID: "about-install-steps-ios" }).length).toBeGreaterThan(0);
    expect(textContent(renderer.root)).toContain("Føj til hjemmeskærm");

    const android = renderer.root.findByProps({ accessibilityLabel: "Android" });
    act(() => android.props.onPress());
    expect(renderer.root.findAllByProps({ testID: "about-install-steps-android" }).length).toBeGreaterThan(0);
    expect(textContent(renderer.root)).toContain("Installer app eller Føj til startskærm");
  });

  test("uses five compact disclosures and preserves legacy deep-link targets", () => {
    let renderer;
    act(() => {
      renderer = TestRenderer.create(<AboutSupportScreen initialSection="limitations" />);
    });

    expect(renderer.root.findAllByProps({ testID: "about-support-section-about" }).length).toBeGreaterThan(0);
    expect(renderer.root.findAllByProps({ testID: "about-support-section-sources" }).length).toBeGreaterThan(0);
    expect(renderer.root.findAllByProps({ testID: "about-support-section-medical" }).length).toBeGreaterThan(0);
    expect(renderer.root.findAllByProps({ testID: "about-support-section-contact" }).length).toBeGreaterThan(0);
    expect(renderer.root.findAllByProps({ testID: "about-support-section-app" }).length).toBeGreaterThan(0);
    expect(renderer.root.findAllByProps({ testID: "about-support-section-limitations" })).toHaveLength(0);
    expect(
      renderer.root.findByProps({ accessibilityLabel: "Ansvarsfraskrivelse" }).props.accessibilityState,
    ).toEqual({ expanded: true });

    const copy = textContent(renderer.root);
    expect(copy).toContain("Kilder og fagligt grundlag");
    expect(copy).not.toContain("nikolai_91@live.com");
    expect(copy).not.toContain("Grundlæggende brug af appen og værktøjerne kan registreres");
  });

  test("starts every detail closed and keeps only one section open", () => {
    let renderer;
    act(() => {
      renderer = TestRenderer.create(<AboutSupportScreen />);
    });

    expect(renderer.root.findAllByProps({ testID: "about-disclosure-body" })).toHaveLength(0);

    const project = renderer.root.findByProps({ accessibilityLabel: "Om projektet" });
    act(() => project.props.onPress());
    expect(project.props.accessibilityState).toEqual({ expanded: true });
    expect(textContent(renderer.root)).toContain("At mindske friktion");

    const privacy = renderer.root.findByProps({ accessibilityLabel: "Privatliv og data" });
    act(() => privacy.props.onPress());
    expect(renderer.root.findByProps({ accessibilityLabel: "Om projektet" }).props.accessibilityState).toEqual({ expanded: false });
    expect(privacy.props.accessibilityState).toEqual({ expanded: true });
    expect(textContent(renderer.root)).not.toContain("At mindske friktion");
    expect(textContent(renderer.root)).toContain("Indstillinger og favoritter gemmes lokalt");
  });

  test("removes disclosure and selection transitions when Reduced Motion is enabled", () => {
    mockUseReducedMotionPreference.mockReturnValue(true);
    let renderer;
    act(() => {
      renderer = TestRenderer.create(<AboutSupportScreen />);
    });

    const toggle = renderer.root.findByProps({ testID: "about-install-toggle" });
    act(() => toggle.props.onPress());

    const motionlessNodes = renderer.root.findAll(
      (node) => node.props.style?.transition === "none",
    );
    expect(motionlessNodes.length).toBeGreaterThan(0);
  });
});

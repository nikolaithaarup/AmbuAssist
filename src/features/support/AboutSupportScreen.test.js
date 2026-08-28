import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { Linking, Text } from "react-native";
import { AboutSupportScreen } from "./AboutSupportScreen";

jest.mock("../../i18n/useT", () => {
  const { da } = jest.requireActual("../../i18n/strings");
  return { useT: () => ({ lang: "da", t: (key) => da[key] ?? key }) };
});

function textContent(root) {
  return root
    .findAllByType(Text)
    .flatMap((node) => node.props.children)
    .filter((child) => typeof child === "string")
    .join(" ");
}

describe("AboutSupportScreen", () => {
  afterEach(() => jest.restoreAllMocks());

  test("presents five compact information areas collapsed by default", () => {
    let renderer;
    act(() => {
      renderer = TestRenderer.create(<AboutSupportScreen />);
    });

    const root = renderer.root;
    expect(root.findAllByProps({ testID: "about-support-section-about" }).length).toBeGreaterThan(0);
    expect(root.findAllByProps({ testID: "about-support-section-medical" }).length).toBeGreaterThan(0);
    expect(root.findAllByProps({ testID: "about-support-section-contact" }).length).toBeGreaterThan(0);
    expect(root.findAllByProps({ testID: "about-support-section-limitations" }).length).toBeGreaterThan(0);
    expect(root.findAllByProps({ testID: "about-support-section-app" }).length).toBeGreaterThan(0);
    expect(root.findByProps({ accessibilityLabel: "Hvad AmbuAssist er" }).props.accessibilityState).toEqual({ expanded: false });
    expect(textContent(root)).toContain("AmbuAssist");
  });

  test("keeps only one section expanded at a time", () => {
    let renderer;
    act(() => {
      renderer = TestRenderer.create(<AboutSupportScreen />);
    });

    const about = renderer.root.findByProps({ accessibilityLabel: "Hvad AmbuAssist er" });
    const medical = renderer.root.findByProps({ accessibilityLabel: "Medicinsk disclaimer" });
    act(() => about.props.onPress());
    expect(renderer.root.findByProps({ accessibilityLabel: "Hvad AmbuAssist er" }).props.accessibilityState).toEqual({ expanded: true });
    act(() => medical.props.onPress());
    expect(renderer.root.findByProps({ accessibilityLabel: "Hvad AmbuAssist er" }).props.accessibilityState).toEqual({ expanded: false });
    expect(renderer.root.findByProps({ accessibilityLabel: "Medicinsk disclaimer" }).props.accessibilityState).toEqual({ expanded: true });
  });

  test("legacy section targeting opens the full medical and contact content", () => {
    let medicalRenderer;
    act(() => {
      medicalRenderer = TestRenderer.create(
        <AboutSupportScreen initialSection="medical" />,
      );
    });
    expect(
      medicalRenderer.root.findByProps({ accessibilityLabel: "Medicinsk disclaimer" })
        .props.accessibilityState,
    ).toEqual({ expanded: true });
    expect(textContent(medicalRenderer.root)).toContain(
      "Brug af appen må aldrig forsinke nødvendig behandling.",
    );

    let contactRenderer;
    act(() => {
      contactRenderer = TestRenderer.create(
        <AboutSupportScreen initialSection="contact" />,
      );
    });
    expect(contactRenderer.root.findAllByProps({ testID: "about-support-email" }).length).toBeGreaterThan(0);
    expect(contactRenderer.root.findAllByProps({ testID: "about-support-report-error" }).length).toBeGreaterThan(0);
    expect(contactRenderer.root.findAllByProps({ testID: "about-support-suggest-improvement" }).length).toBeGreaterThan(0);
    expect(textContent(contactRenderer.root)).toContain("nikolai_91@live.com");
  });

  test("keeps app version information available", () => {
    let renderer;
    act(() => {
      renderer = TestRenderer.create(<AboutSupportScreen initialSection="app" />);
    });
    expect(textContent(renderer.root)).toContain("Version");
  });

  test("keeps the detailed mailto feedback action", async () => {
    jest.spyOn(Linking, "canOpenURL").mockResolvedValue(true);
    jest.spyOn(Linking, "openURL").mockResolvedValue();
    let renderer;
    act(() => {
      renderer = TestRenderer.create(
        <AboutSupportScreen initialSection="contact" />,
      );
    });

    await act(async () => {
      renderer.root.findByProps({ testID: "about-support-email" }).props.onPress();
      await Promise.resolve();
    });

    expect(Linking.openURL).toHaveBeenCalledWith(
      expect.stringMatching(/^mailto:nikolai_91%?@live\.com\?subject=/),
    );
  });
});

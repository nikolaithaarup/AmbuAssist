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

  test("presents one progressive-disclosure surface with all four information areas", () => {
    let renderer;
    act(() => {
      renderer = TestRenderer.create(<AboutSupportScreen />);
    });

    const root = renderer.root;
    expect(root.findAllByProps({ testID: "about-support-section-about" }).length).toBeGreaterThan(0);
    expect(root.findAllByProps({ testID: "about-support-section-medical" }).length).toBeGreaterThan(0);
    expect(root.findAllByProps({ testID: "about-support-section-contact" }).length).toBeGreaterThan(0);
    expect(root.findAllByProps({ testID: "about-support-section-app" }).length).toBeGreaterThan(0);
    expect(root.findByProps({ accessibilityLabel: "Hvad AmbuAssist er" }).props.accessibilityState).toEqual({ expanded: true });
    expect(textContent(root)).toContain("AmbuAssist");
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
    expect(textContent(contactRenderer.root)).toContain("nikolai_91@live.com");
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

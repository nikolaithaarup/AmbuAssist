import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { Modal, Text } from "react-native";
import {
  ClinicalDisclosure,
  formatClinicalDisclosureTriggerLabel,
} from "./ClinicalDisclosure";

let mockLanguage = "da";

jest.mock("../i18n/useT", () => {
  const { da, en } = jest.requireActual("../i18n/strings");
  return {
    useT: () => ({
      lang: mockLanguage,
      t: (key) => (mockLanguage === "da" ? da : en)[key],
    }),
  };
});

function renderDisclosure(props = {}) {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(
      <ClinicalDisclosure
        disclaimer="This complete disclaimer must remain readable."
        sourcesIntro="Tool-specific reference introduction."
        sources={[
          {
            id: "source-1",
            title: "Tool-specific guideline",
            subtitle: "Edition 2026",
            url: "https://example.com/guideline",
          },
        ]}
        {...props}
      />,
    );
  });
  return renderer;
}

function renderedText(root) {
  return root
    .findAllByType(Text)
    .flatMap((node) => node.props.children)
    .filter((child) => typeof child === "string")
    .join(" ");
}

describe("ClinicalDisclosure", () => {
  beforeEach(() => {
    mockLanguage = "da";
  });

  it("formats localized singular, plural, and empty source counts", () => {
    expect(
      formatClinicalDisclosureTriggerLabel("Kilder", "kilde", "kilder", 1),
    ).toBe("Kilder · 1 kilde");
    expect(
      formatClinicalDisclosureTriggerLabel("Sources", "source", "sources", 2),
    ).toBe("Sources · 2 sources");
    expect(
      formatClinicalDisclosureTriggerLabel("Sources", "source", "sources", 0),
    ).toBe("Sources");
  });

  it("opens, exposes the complete tool-specific content, and closes", () => {
    const renderer = renderDisclosure();
    const root = renderer.root;

    expect(root.findByType(Modal).props.visible).toBe(false);
    expect(
      root.findByProps({ testID: "clinical-disclosure-trigger" }).props
        .accessibilityLabel,
    ).toBe("Kilder & medicinsk disclaimer · 1 kilde");

    act(() => {
      root.findByProps({ testID: "clinical-disclosure-trigger" }).props.onPress();
    });

    expect(root.findByType(Modal).props.visible).toBe(true);
    const text = renderedText(root);
    expect(text).toContain("This complete disclaimer must remain readable.");
    expect(text).toContain("Tool-specific reference introduction.");
    expect(text).toContain("Tool-specific guideline");
    expect(text).toContain("Edition 2026");
    expect(text).toContain("Åbn kilde");

    act(() => {
      root.findByProps({ testID: "clinical-disclosure-close" }).props.onPress();
    });
    expect(root.findByType(Modal).props.visible).toBe(false);
  });

  it("handles missing tool-specific content without hiding the disclosure", () => {
    mockLanguage = "en";
    const renderer = renderDisclosure({ disclaimer: "", sourcesIntro: "", sources: [] });
    const root = renderer.root;

    expect(
      root.findByProps({ testID: "clinical-disclosure-trigger" }).props
        .accessibilityLabel,
    ).toBe("Sources & medical disclaimer");

    act(() => {
      root.findByProps({ testID: "clinical-disclosure-trigger" }).props.onPress();
    });

    const text = renderedText(root);
    expect(text).toContain("No tool-specific disclaimer is available.");
    expect(text).toContain("No tool-specific sources are available.");
  });
});

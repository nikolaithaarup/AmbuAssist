import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { Text } from "react-native";
import NEWS2 from "../../../app/tools/assessment-tools/news2";

jest.mock("../../i18n/useT", () => {
  const { da } = jest.requireActual("../../i18n/strings");
  return { useT: () => ({ t: (key) => da[key] ?? key }) };
});
jest.mock("../../state/settings", () => ({
  useSettings: () => ({ settings: { language: "da" } }),
}));
jest.mock("../../services/referenceService", () => ({
  getReference: jest.fn().mockResolvedValue(null),
}));
jest.mock("../../ui/useSuccessHaptic", () => ({ useSuccessHaptic: jest.fn() }));
jest.mock("../../ui/haptics", () => ({ hapticReset: jest.fn() }));

function textContent(root) {
  return root
    .findAllByType(Text)
    .flatMap((node) => (Array.isArray(node.props.children) ? node.props.children : [node.props.children]))
    .filter((child) => typeof child === "string" || typeof child === "number")
    .join(" ");
}

describe("NEWS2 screen", () => {
  test("updates the visible total from compact controls without changing scoring", async () => {
    let renderer;
    await act(async () => {
      renderer = TestRenderer.create(<NEWS2 />);
      await Promise.resolve();
    });

    const root = renderer.root;
    act(() => {
      root.findByProps({ accessibilityLabel: "Resp. frekvens (RF)" }).props.onChangeText("25");
      root.findByProps({ accessibilityLabel: "SpO₂" }).props.onChangeText("93");
      root.findByProps({ accessibilityLabel: "Systolisk BT" }).props.onChangeText("100");
      root.findByProps({ accessibilityLabel: "Puls" }).props.onChangeText("111");
      root.findByProps({ accessibilityLabel: "Temperatur" }).props.onChangeText("39.1");
      root.findByProps({ accessibilityLabel: "Ja" }).props.onPress();
      root.findByProps({ accessibilityLabel: "V" }).props.onPress();
    });

    expect(textContent(renderer.root)).toContain("NEWS2:  16");
    expect(renderer.root.findByProps({ accessibilityLabel: "Ja" }).props.accessibilityState).toEqual({ selected: true });
  });
});

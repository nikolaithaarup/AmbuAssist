import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { Text, TextInput } from "react-native";

import { BloodGasInputCard } from "./BloodGasInputCard";
import { GroupedBloodGasInput } from "./GroupedBloodGasInput";
import { makeEmptyBloodGasFormValues } from "./helpers";

jest.mock("../../i18n/useT", () => ({
  useT: () => ({ t: (key) => ({ bg_label_ph: "pH", bg_label_pco2: "pCO₂ (kPa)" })[key] ?? key }),
}));
jest.mock("../../state/settings", () => ({ useSettings: () => ({ settings: { language: "da" } }) }));
jest.mock("../../ui/responsive", () => ({ useResponsiveLayout: () => ({ isCompact: false, isExpanded: false }) }));

describe("compact VGAS entry", () => {
  test("keeps units explicit, avoids reference values as placeholders, and shows field errors inline", () => {
    const values = makeEmptyBloodGasFormValues();
    values.ph = "74";
    let renderer;

    act(() => {
      renderer = TestRenderer.create(
        <BloodGasInputCard values={values} onChange={jest.fn()} fields={["ph", "pco2"]} />,
      );
    });

    const inputs = renderer.root.findAllByType(TextInput);
    expect(inputs).toHaveLength(2);
    expect(inputs.map((input) => input.props.placeholder)).toEqual(["—", "—"]);
    expect(inputs[1].props.accessibilityLabel).toBe("pCO₂, kPa");
    expect(renderer.root.findAllByType(Text).some((node) => node.props.children === "Kontrollér værdien og enheden")).toBe(true);
  });

  test("shows common acid-base values first and progressively discloses other groups", () => {
    let renderer;
    act(() => {
      renderer = TestRenderer.create(
        <GroupedBloodGasInput values={makeEmptyBloodGasFormValues()} onChange={jest.fn()} isDa />,
      );
    });

    expect(renderer.root.findAllByType(TextInput)).toHaveLength(4);
    const oxygenation = renderer.root.findByProps({ accessibilityLabel: "Iltning på VGAS" });
    expect(oxygenation.props.accessibilityState).toEqual({ expanded: false });

    act(() => oxygenation.props.onPress());
    expect(renderer.root.findAllByType(TextInput)).toHaveLength(6);
  });
});

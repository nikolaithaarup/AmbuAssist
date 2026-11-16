import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { PwaUpdateBanner } from "./PwaUpdateBanner.web";

describe("AmbuAssist PWA update banner", () => {
  test("offers an explicit update button and an independent Later action", () => {
    const update = jest.fn();
    const dismiss = jest.fn();
    let renderer;
    act(() => {
      renderer = TestRenderer.create(
        <PwaUpdateBanner updating={false} onUpdate={update} onDismiss={dismiss} />,
      );
    });
    const root = renderer.root;
    expect(root.findByProps({ testID: "pwa-update-banner" }).props.accessibilityLiveRegion).toBe("polite");
    const updateButton = root.findByProps({ accessibilityLabel: "Opdatér AmbuAssist" });
    const laterButton = root.findByProps({ accessibilityLabel: "Senere" });
    expect(updateButton.props.accessibilityRole).toBe("button");
    expect(updateButton.props.accessibilityState).toEqual({ disabled: false });
    act(() => updateButton.props.onPress());
    expect(update).toHaveBeenCalledTimes(1);
    expect(dismiss).not.toHaveBeenCalled();
    act(() => laterButton.props.onPress());
    expect(dismiss).toHaveBeenCalledTimes(1);
    act(() => renderer.unmount());
  });

  test("disables the update and dismiss actions while reloading", () => {
    const update = jest.fn();
    const dismiss = jest.fn();
    let renderer;
    act(() => {
      renderer = TestRenderer.create(
        <PwaUpdateBanner updating onUpdate={update} onDismiss={dismiss} />,
      );
    });
    const root = renderer.root;
    expect(root.findByProps({ accessibilityLabel: "Opdatér AmbuAssist" }).props.disabled).toBe(true);
    expect(root.findByProps({ accessibilityLabel: "Senere" }).props.disabled).toBe(true);
    act(() => renderer.unmount());
  });
});

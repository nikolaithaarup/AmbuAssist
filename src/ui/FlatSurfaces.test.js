import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { StyleSheet, Text } from "react-native";
import { Card } from "./Ui";
import { ToolActionButton, ToolSurface } from "./ToolSurface";
import { AssessmentCard } from "./AssessmentCompact";
import { theme } from "./theme";

function mount(element) {
  let renderer;
  act(() => { renderer = TestRenderer.create(element); });
  return renderer;
}

describe("app-wide flat surface policy", () => {
  test("ordinary Card sections have no background, frame or drop shadow", () => {
    const renderer = mount(<Card><Text>Clinical text</Text></Card>);
    const view = renderer.root.findByType(Card).findAll(node => Array.isArray(node.props.style))[0];
    const style = StyleSheet.flatten(view.props.style);
    expect(style.backgroundColor).toBe("transparent");
    expect(style.borderWidth).toBe(0);
    expect(style.boxShadow).toBeUndefined();
    expect(style.elevation).toBeUndefined();
    act(() => renderer.unmount());
  });

  test("ToolSurface uses no outer box, but danger keeps a visible status rule", () => {
    const renderer = mount(<ToolSurface tone="danger" testID="status"><Text>Critical finding</Text></ToolSurface>);
    const outer = renderer.root.findAllByProps({ testID: "status" })
      .find(node => node.props.style);
    const style = StyleSheet.flatten(outer.props.style);
    expect(style.borderWidth).toBe(0);
    expect(style.backgroundColor).toBe("transparent");
    expect(style.borderLeftWidth).toBe(3);
    expect(style.borderLeftColor).toBe(theme.colors.danger);
    act(() => renderer.unmount());
  });

  test("assessment surfaces are flat; actual call buttons remain visible and tappable", () => {
    const onPress = jest.fn();
    const renderer = mount(<AssessmentCard><ToolActionButton label="Ring" tone="call" onPress={onPress} /></AssessmentCard>);
    const section = renderer.root.findAllByProps({ testID: "assessment-compact-card" })[0];
    const surface = StyleSheet.flatten(section.props.style);
    expect(surface.borderWidth).toBe(0);
    expect(surface.backgroundColor).toBe("transparent");
    const button = renderer.root.findAll(node =>
      node.props.accessibilityLabel === "Ring" && typeof node.props.onPress === "function")[0];
    expect(button).toBeDefined();
    expect(button.props.accessibilityRole).toBe("button");
    act(() => button.props.onPress());
    expect(onPress).toHaveBeenCalledTimes(1);
    act(() => renderer.unmount());
  });

  test("explicit caller warning styles can still add meaningful emphasis", () => {
    const renderer = mount(<Card style={{ borderLeftWidth: 3, borderLeftColor: "orange" }}><Text>Warning</Text></Card>);
    const view = renderer.root.findByType(Card).findAll(node => Array.isArray(node.props.style))[0];
    const style = StyleSheet.flatten(view.props.style);
    expect(style.borderWidth).toBe(0);
    expect(style.borderLeftWidth).toBe(3);
    expect(style.borderLeftColor).toBe("orange");
    act(() => renderer.unmount());
  });
});

import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { Text } from "react-native";
import { AssessmentCard } from "./AssessmentCompact";

describe("assessment-only compact surface", () => {
  it("keeps content and allows a caller's explicit compact styling", () => {
    let renderer;
    act(() => { renderer = TestRenderer.create(
      <AssessmentCard style={{ padding: 7 }}><Text>Clinical content</Text></AssessmentCard>,
    ); });
    const section = renderer.root.findAllByProps({ testID: "assessment-compact-card" })[0];
    expect(section).toBeDefined();
    expect(section.props.style).toEqual(expect.arrayContaining([
      expect.objectContaining({ padding: 11 }),
      expect.objectContaining({ padding: 7 }),
    ]));
    expect(renderer.root.findAllByType(Text).some(node => node.props.children === "Clinical content")).toBe(true);
    act(() => renderer.unmount());
  });
});

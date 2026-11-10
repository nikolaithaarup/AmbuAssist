import React from "react";
import TestRenderer, { act } from "react-test-renderer";

// Test by the public, unique testID contract. In Jest's React Native renderer,
// a Pressable may appear as an implementation component and several host nodes.
// Neither findAllByType(Pressable) nor a raw count of forwarded testIDs is stable.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
jest.mock("../../i18n/useT", () => ({ useT: () => ({ t: key => key }) }));
jest.mock("../../ui/Background", () => {
  const { View: MockView } = require("react-native");
  return { Background: ({ children }) => <MockView>{children}</MockView> };
});
jest.mock("../../ui/Ui", () => {
  const { View: MockView, Text: MockText } = require("react-native");
  return {
    Screen: ({ children }) => <MockView>{children}</MockView>,
    Title: ({ children }) => <MockText>{children}</MockText>,
    Subtle: ({ children }) => <MockText>{children}</MockText>,
  };
});
const Exams = require("../../../app/tools/exams").default;

describe("Clinical exams: compact topic-first navigation", () => {
  let renderer;
  beforeEach(() => { act(() => { renderer = TestRenderer.create(<Exams />); }); });
  afterEach(() => { act(() => renderer?.unmount()); renderer = null; });

  function nodes(id) {
    return renderer.root.findAllByProps({ testID: id });
  }
  function uniqueIds(prefix) {
    return [...new Set(renderer.root.findAll(node =>
      typeof node.props.testID === "string" && node.props.testID.startsWith(prefix),
    ).map(node => node.props.testID))];
  }
  function press(id) {
    // Match the same action contract used in other AmbuAssist component tests.
    const action = nodes(id).find(node => typeof node.props.onPress === "function");
    expect(action).toBeDefined();
    act(() => action.props.onPress());
  }
  function expectVisible(id) {
    expect(nodes(id).length).toBeGreaterThan(0);
  }
  function expectHidden(id) {
    expect(nodes(id)).toHaveLength(0);
  }
  function textVisible(text) {
    return renderer.root.findAll(node => node.props.children === text).length > 0;
  }

  test("seven topics initially collapsed, not all examinations expanded", () => {
    expect(uniqueIds("exams-group-").sort()).toEqual([
      "exams-group-abdomen", "exams-group-cns", "exams-group-back",
      "exams-group-thorax", "exams-group-uro", "exams-group-ob",
      "exams-group-trauma",
    ].sort());
    expectHidden("exams-item-mcburney");
    expectHidden("exams-item-brudzinski");
    expectVisible("exams-caution");
  });

  test("expand topic then examination; one tap reveals technique and findings", () => {
    press("exams-group-abdomen");
    expectVisible("exams-item-mcburney");
    expectHidden("exams-detail-mcburney");
    press("exams-item-mcburney");
    expectVisible("exams-detail-mcburney");
    expect(textVisible("ex_label_how")).toBe(true);
    expect(textVisible("ex_label_positive")).toBe(true);
    expect(textVisible("ex_label_indicates")).toBe(true);
  });

  test("opening another topic collapses the previous topic and its expanded exam", () => {
    press("exams-group-abdomen");
    press("exams-item-mcburney");
    press("exams-group-cns");
    expectHidden("exams-item-mcburney");
    expectVisible("exams-item-brudzinski");
    expectHidden("exams-detail-mcburney");
  });
});

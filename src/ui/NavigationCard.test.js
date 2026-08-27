import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { NavigationCard } from "./NavigationCard";

describe("NavigationCard", () => {
  test("keeps navigation and favourite actions independent and accessible", () => {
    const onPress = jest.fn();
    const onToggleFavourite = jest.fn();
    let renderer;

    act(() => {
      renderer = TestRenderer.create(
        <NavigationCard
          title="Destination"
          description="Find the receiving hospital"
          favourite
          onPress={onPress}
          onToggleFavourite={onToggleFavourite}
        />,
      );
    });

    const root = renderer.root;
    const navigationAction = root.findByProps({
      accessibilityLabel: "Destination. Find the receiving hospital",
    });
    const favouriteAction = root.findByProps({
      accessibilityLabel: "Remove favourite",
    });

    expect(navigationAction.props.accessibilityRole).toBe("button");
    expect(favouriteAction.props.accessibilityRole).toBe("button");
    expect(favouriteAction.props.accessibilityState).toEqual({ selected: true });

    act(() => navigationAction.props.onPress());
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onToggleFavourite).not.toHaveBeenCalled();

    act(() => favouriteAction.props.onPress());
    expect(onToggleFavourite).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

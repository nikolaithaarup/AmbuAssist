import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { SettingsProvider, useSettings } from "./settings";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

let currentContext;

function Probe() {
  currentContext = useSettings();
  return null;
}

const storedSettings = (favourites) => ({
  version: 2,
  language: "da",
  defaultJPerKg: 4,
  formula: "APLS_1_5",
  customLinearA: 2,
  customLinearB: 8,
  meds: [],
  destinationCategoryFavourites: favourites,
});

describe("Destination favourites in persisted app settings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentContext = undefined;
  });

  test("an intentionally empty persisted list remains empty", async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(
      JSON.stringify(storedSettings([])),
    );
    let renderer;
    await act(async () => {
      renderer = TestRenderer.create(
        <SettingsProvider>
          <Probe />
        </SettingsProvider>,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(currentContext.isReady).toBe(true);
    expect(currentContext.settings.destinationCategoryFavourites).toEqual([]);
    await act(async () => renderer.unmount());
  });

  test("a customized list is written through the existing settings storage", async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(
      JSON.stringify(storedSettings(null)),
    );
    let renderer;
    await act(async () => {
      renderer = TestRenderer.create(
        <SettingsProvider>
          <Probe />
        </SettingsProvider>,
      );
      await Promise.resolve();
      await Promise.resolve();
    });
    await act(async () => {
      currentContext.setSettings((current) => ({
        ...current,
        destinationCategoryFavourites: ["kardiologi"],
      }));
      await Promise.resolve();
    });

    const storedWrite = AsyncStorage.setItem.mock.calls
      .map(([, value]) => JSON.parse(value))
      .find(
        (value) =>
          value.destinationCategoryFavourites?.[0] === "kardiologi",
      );
    expect(storedWrite.destinationCategoryFavourites).toEqual(["kardiologi"]);
    await act(async () => renderer.unmount());
  });
});

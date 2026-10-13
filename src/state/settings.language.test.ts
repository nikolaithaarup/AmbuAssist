import { applyDocumentLanguage } from "./settings";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

describe("web document language", () => {
  test.each(["da", "en"] as const)(
    "synchronizes the selected %s language with the document",
    (language) => {
      const target = { documentElement: { lang: "" } };
      applyDocumentLanguage(language, target);
      expect(target.documentElement.lang).toBe(language);
    },
  );
});

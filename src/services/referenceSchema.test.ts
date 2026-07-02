import { parseReferencePayload } from "./referenceSchema";

const validPayload = {
  key: "news2",
  version: 2,
  updatedAt: "2026-07-02T10:00:00.000Z",
  reviewDate: "2026-06-30",
  disclaimer: { en: "English disclaimer", da: "Dansk disclaimer" },
  sourcesSub: { en: "English sources", da: "Danske kilder" },
  sources: [
    {
      id: "official-guidance",
      title: { en: "Official guidance", da: "Officiel vejledning" },
      subtitle: { en: "English detail", da: "Dansk detalje" },
      url: {
        en: "https://example.org/guidance?lang=en",
        da: "https://example.org/guidance?lang=da",
      },
    },
  ],
};

describe("clinical reference schema", () => {
  test("accepts valid reference content and metadata", () => {
    expect(parseReferencePayload(validPayload)).toEqual(validPayload);
  });

  test("accepts omitted optional fields", () => {
    expect(
      parseReferencePayload({
        sources: [
          {
            id: "source-1",
            title: { en: "English title", da: "Dansk titel" },
          },
        ],
      }),
    ).not.toBeNull();
  });

  test.each([
    ["title", { ...validPayload, sources: [{ ...validPayload.sources[0], title: { en: "", da: "Titel" } }] }],
    ["source", { ...validPayload, sources: [{ ...validPayload.sources[0], id: "" }] }],
    ["URL", { ...validPayload, sources: [{ ...validPayload.sources[0], url: { en: "not-a-url", da: "https://example.org" } }] }],
    ["review date", { ...validPayload, reviewDate: "not-a-date" }],
    ["updated date", { ...validPayload, updatedAt: "yesterday-ish" }],
    ["version", { ...validPayload, version: 0 }],
    ["version integer", { ...validPayload, version: 1.5 }],
    ["optional subtitle", { ...validPayload, sources: [{ ...validPayload.sources[0], subtitle: { en: 42, da: "Detalje" } }] }],
  ])("rejects invalid %s metadata", (_field, payload) => {
    expect(parseReferencePayload(payload)).toBeNull();
  });
});

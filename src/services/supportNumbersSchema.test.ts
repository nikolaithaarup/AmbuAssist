import {
  parseSupportNumbersPayload,
  resolveSupportNumbersUpdate,
  type SupportNumber,
} from "./supportNumbersSchema";

function number(
  id: string,
  overrides: Partial<SupportNumber> = {},
): SupportNumber {
  return {
    id,
    nameDa: `Dansk ${id}`,
    nameEn: `English ${id}`,
    phone: "+4512345678",
    sortOrder: 10,
    active: true,
    ...overrides,
  };
}

describe("support-number payload validation", () => {
  test("accepts a valid payload and preserves active support-number data", () => {
    const payload = [
      number("second", { sortOrder: 20 }),
      number("first", { sortOrder: 10 }),
      number("inactive", { active: false }),
    ];

    expect(parseSupportNumbersPayload(payload)).toEqual(payload);
    expect(resolveSupportNumbersUpdate(payload, null, []).data).toEqual([
      payload[1],
      payload[0],
    ]);
  });

  test.each([
    null,
    {},
    [{ id: "missing-fields" }],
    [number("bad-phone", { phone: "" })],
    [number("bad-order", { sortOrder: Number.NaN })],
  ])("rejects a malformed payload", (payload) => {
    expect(parseSupportNumbersPayload(payload)).toBeNull();
  });

  test("uses a known-good cache and forbids a cache write for invalid remote data", () => {
    const cached = [number("cached")];
    const bundled = [number("bundled")];
    const update = resolveSupportNumbersUpdate(
      [{ id: "invalid" }],
      cached,
      bundled,
    );

    expect(update.data).toEqual(cached);
    expect(update.dataToCache).toBeNull();
  });

  test("uses bundled data when remote data is invalid and no cache exists", () => {
    const bundled = [number("bundled")];
    const update = resolveSupportNumbersUpdate({}, null, bundled);

    expect(update.data).toEqual(bundled);
    expect(update.dataToCache).toBeNull();
  });

  test("rejects an otherwise valid payload containing one invalid entry", () => {
    const cached = [number("cached")];
    const partiallyInvalid = [number("valid"), { ...number("invalid"), phone: 1234 }];
    const update = resolveSupportNumbersUpdate(
      partiallyInvalid,
      cached,
      [number("bundled")],
    );

    expect(parseSupportNumbersPayload(partiallyInvalid)).toBeNull();
    expect(update.data).toEqual(cached);
    expect(update.dataToCache).toBeNull();
  });
});

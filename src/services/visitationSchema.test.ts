import {
  parseVisitationData,
  resolveVisitationUpdate,
  type BackendVisitationData,
} from "./visitationSchema";

function makeValidData(version: string): BackendVisitationData {
  return {
    version,
    updatedAt: "2026-07-02T00:00:00.000Z",
    byen: {
      categories: [{ key: "hospital", labelKey: "dest_cat_hospital" }],
      map: {
        Bispebjerg: { hospital: "BBH" },
      },
      streetSample: [{ street: "Testvej", bydel: "Bispebjerg" }],
    },
    region: {
      categories: [
        { key: "akutmodtagelse", labelKey: "dest_reg_akutmodtagelse" },
      ],
      map: {
        Ballerup: { akutmodtagelse: "HEH" },
      },
    },
  } as BackendVisitationData;
}

describe("visitation data schema", () => {
  test("accepts valid visitation data without changing assignments", () => {
    const data = makeValidData("valid-v1");

    expect(parseVisitationData(data)).toEqual(data);
    expect(resolveVisitationUpdate(data, null, makeValidData("local"))).toEqual({
      data,
      dataToCache: data,
    });
  });

  test.each([
    { version: "bad", byen: null, region: {} },
    { ...makeValidData("bad-code"), byen: {
      ...makeValidData("bad-code").byen,
      map: { Bispebjerg: { hospital: "NOT_A_HOSPITAL" } },
    } },
    { ...makeValidData("bad-category"), region: {
      ...makeValidData("bad-category").region,
      categories: [{ key: "unknown_category", labelKey: "unknown" }],
    } },
  ])("rejects malformed visitation data", (data) => {
    expect(parseVisitationData(data)).toBeNull();
  });

  test("uses a known-good cache when remote data is invalid", () => {
    const cached = makeValidData("cached-good");
    const local = makeValidData("local");
    const malformedRemote = { version: "remote-bad", byen: {}, region: {} };

    const update = resolveVisitationUpdate(malformedRemote, cached, local);

    expect(update.data).toBe(cached);
    expect(update.dataToCache).toBeNull();
  });

  test("uses local data when remote data is invalid and no cache exists", () => {
    const local = makeValidData("local");
    const update = resolveVisitationUpdate({}, null, local);

    expect(update.data).toBe(local);
    expect(update.dataToCache).toBeNull();
  });
});

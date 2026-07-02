const mockGetDoc = jest.fn();
const mockGetDocs = jest.fn();

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(() => ({})),
  doc: jest.fn(() => ({})),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
}));

jest.mock("../lib/firebase", () => ({ db: {} }), { virtual: true });

import AsyncStorage from "@react-native-async-storage/async-storage";
import { SUPPORT_NUMBERS_FALLBACK } from "../data/supportNumbersFallback";
import { getReference } from "./referenceService";
import { getSupportNumbers } from "./supportNumbers";
import {
  LOCAL_VISITATION_DATA,
  loadVisitationData,
} from "./visitationService";
import type { BackendVisitationData } from "./visitationSchema";

const mockGetItem = AsyncStorage.getItem as jest.Mock;
const mockSetItem = AsyncStorage.setItem as jest.Mock;

function cachedVisitation(version = "cached-v1"): BackendVisitationData {
  return {
    ...LOCAL_VISITATION_DATA,
    version,
  };
}

function visitationSnapshot(areas: Record<string, unknown>) {
  return {
    forEach: (callback: (areaDoc: { id: string; data: () => unknown }) => void) => {
      Object.entries(areas).forEach(([id, data]) => {
        callback({ id, data: () => data });
      });
    },
  };
}

function supportSnapshot(entries: Array<{ id: string; data: unknown }>) {
  return {
    docs: entries.map((entry) => ({
      id: entry.id,
      data: () => entry.data,
    })),
  };
}

describe("offline and failure behavior", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(undefined);
    jest.spyOn(console, "log").mockImplementation(() => undefined);
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("visitation fallback chain", () => {
    test("uses valid remote data first and caches it", async () => {
      const local = LOCAL_VISITATION_DATA;
      mockGetItem.mockResolvedValue(JSON.stringify(cachedVisitation()));
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          activeVersion: "remote-v2",
          updatedAt: "2026-07-02T00:00:00.000Z",
        }),
      });
      mockGetDocs.mockResolvedValue(
        visitationSnapshot({
          byen: local.byen,
          regionMidt: local.region,
        }),
      );

      const result = await loadVisitationData();

      expect(result.version).toBe("remote-v2");
      expect(mockSetItem).toHaveBeenCalledTimes(1);
    });

    test("uses validated cache when Firestore is unavailable", async () => {
      const cached = cachedVisitation();
      mockGetItem.mockResolvedValue(JSON.stringify(cached));
      mockGetDoc.mockRejectedValue(new Error("offline"));

      await expect(loadVisitationData()).resolves.toEqual(cached);
      expect(mockSetItem).not.toHaveBeenCalled();
    });

    test("rejects malformed remote data without overwriting cache", async () => {
      const cached = cachedVisitation();
      mockGetItem.mockResolvedValue(JSON.stringify(cached));
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ activeVersion: "bad-remote" }),
      });
      mockGetDocs.mockResolvedValue(
        visitationSnapshot({
          byen: { categories: "invalid", map: {}, streetSample: [] },
          regionMidt: { categories: [], map: {} },
        }),
      );

      await expect(loadVisitationData()).resolves.toEqual(cached);
      expect(mockSetItem).not.toHaveBeenCalled();
    });

    test.each([
      ["corrupted", "{not-json"],
      ["missing", null],
    ])("uses bundled data when cache is %s and Firestore fails", async (_case, cache) => {
      mockGetItem.mockResolvedValue(cache);
      mockGetDoc.mockRejectedValue(new Error("offline"));

      await expect(loadVisitationData()).resolves.toBe(LOCAL_VISITATION_DATA);
      expect(mockSetItem).not.toHaveBeenCalled();
    });
  });

  describe("support-number fallback chain", () => {
    const cached = [
      {
        id: "cached",
        nameDa: "Cache",
        nameEn: "Cache",
        phone: "+4511111111",
        active: true,
      },
    ];

    test("uses valid remote data first and caches it", async () => {
      mockGetItem.mockResolvedValue(JSON.stringify(cached));
      mockGetDocs.mockResolvedValue(
        supportSnapshot([
          {
            id: "remote",
            data: {
              nameDa: "Remote",
              nameEn: "Remote",
              phone: "+4522222222",
              active: true,
            },
          },
        ]),
      );

      await expect(getSupportNumbers()).resolves.toEqual([
        expect.objectContaining({ id: "remote" }),
      ]);
      expect(mockSetItem).toHaveBeenCalledTimes(1);
    });

    test("uses validated cache when Firestore is unavailable", async () => {
      mockGetItem.mockResolvedValue(JSON.stringify(cached));
      mockGetDocs.mockRejectedValue(new Error("offline"));

      await expect(getSupportNumbers()).resolves.toEqual(cached);
      expect(mockSetItem).not.toHaveBeenCalled();
    });

    test("rejects a partially malformed remote payload and keeps cache", async () => {
      mockGetItem.mockResolvedValue(JSON.stringify(cached));
      mockGetDocs.mockResolvedValue(
        supportSnapshot([
          {
            id: "valid",
            data: {
              nameDa: "Valid",
              nameEn: "Valid",
              phone: "+4533333333",
              active: true,
            },
          },
          {
            id: "invalid",
            data: { nameDa: "Missing fields", active: true },
          },
        ]),
      );

      await expect(getSupportNumbers()).resolves.toEqual(cached);
      expect(mockSetItem).not.toHaveBeenCalled();
    });

    test.each([
      ["corrupted", "not-json"],
      ["missing", null],
    ])("uses bundled numbers when cache is %s and Firestore fails", async (_case, cache) => {
      mockGetItem.mockResolvedValue(cache);
      mockGetDocs.mockRejectedValue(new Error("offline"));

      await expect(getSupportNumbers()).resolves.toEqual(
        SUPPORT_NUMBERS_FALLBACK,
      );
      expect(mockSetItem).not.toHaveBeenCalled();
    });
  });

  test("returns no clinical reference when Firestore is unavailable", async () => {
    mockGetDoc.mockRejectedValue(new Error("offline"));

    await expect(getReference("news2")).resolves.toBeNull();
  });
});

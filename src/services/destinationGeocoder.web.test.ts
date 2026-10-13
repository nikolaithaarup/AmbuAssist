import {
  normalizeDestinationAddress,
  reverseGeocodeDestination,
} from "./destinationGeocoder.web";

describe("web destination geocoder", () => {
  test("normalizes the same-origin DAR response for shared destination routing", () => {
    expect(
      normalizeDestinationAddress({
        formattedAddress: "Frederiksberg Allé 13A, 1621 København V",
        street: "Frederiksberg Allé",
        streetNumber: "13A",
        postalCode: "1621",
        city: "København V",
        distanceMeters: 7.5,
      }),
    ).toMatchObject({
      street: "Frederiksberg Allé",
      name: "13A",
      postalCode: "1621",
      city: "København V",
      isoCountryCode: "DK",
      distanceMeters: 7.5,
    });
  });

  test("posts coordinates only to the same-origin server route", async () => {
    const fetcher = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        address: {
          formattedAddress: "Slotsgade 10, 3400 Hillerød",
          street: "Slotsgade",
          streetNumber: "10",
          postalCode: "3400",
          city: "Hillerød",
        },
      }),
    });

    await expect(
      reverseGeocodeDestination(
        { latitude: 55.93, longitude: 12.3 },
        fetcher as typeof fetch,
      ),
    ).resolves.toHaveLength(1);

    expect(fetcher).toHaveBeenCalledWith(
      "/api/destination-geocode",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ latitude: 55.93, longitude: 12.3 }),
      }),
    );
    expect(fetcher.mock.calls[0][0]).not.toContain("55.93");
    expect(fetcher.mock.calls[0][0]).not.toContain("12.3");
  });

  test("returns no address for an unresolved or ambiguous location", async () => {
    const fetcher = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ address: null }),
    });
    await expect(
      reverseGeocodeDestination(
        { latitude: 55.93, longitude: 12.3 },
        fetcher as typeof fetch,
      ),
    ).resolves.toEqual([]);
  });

  test("rejects malformed address data instead of guessing", async () => {
    const fetcher = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ address: { city: "Hillerød" } }),
    });
    await expect(
      reverseGeocodeDestination(
        { latitude: 55.93, longitude: 12.3 },
        fetcher as typeof fetch,
      ),
    ).resolves.toEqual([]);
  });

  test("returns an explicit provider failure", async () => {
    const fetcher = jest.fn().mockResolvedValue({ ok: false, status: 503 });
    await expect(
      reverseGeocodeDestination(
        { latitude: 55.93, longitude: 12.3 },
        fetcher as typeof fetch,
      ),
    ).rejects.toMatchObject({ code: "provider_error" });
  });

  test("returns an explicit network failure", async () => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: true,
    });
    const fetcher = jest.fn().mockRejectedValue(new TypeError("network down"));
    await expect(
      reverseGeocodeDestination(
        { latitude: 55.93, longitude: 12.3 },
        fetcher as typeof fetch,
      ),
    ).rejects.toMatchObject({ code: "provider_error" });
  });
});

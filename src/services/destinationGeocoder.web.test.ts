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
          distanceMeters: 9,
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

  test("deduplicates, sorts and caps validated nearby candidates", async () => {
    const address = (formattedAddress: string, distanceMeters: number) => ({
      formattedAddress,
      street: formattedAddress.split(" ")[0],
      streetNumber: "1",
      postalCode: "2100",
      city: "København Ø",
      distanceMeters,
    });
    const fetcher = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        addresses: [
          address("Sjettevej 1, 2100 København Ø", 60),
          address("Andenvej 1, 2100 København Ø", 20),
          address("Førstevej 1, 2100 København Ø", 8),
          address("Tredjevej 1, 2100 København Ø", 30),
          address("Fjerdevej 1, 2100 København Ø", 40),
          address("Femtevej 1, 2100 København Ø", 50),
          address(" førstevej 1, 2100 københavn ø ", 12),
        ],
      }),
    });

    const result = await reverseGeocodeDestination(
      { latitude: 55.93, longitude: 12.3 },
      fetcher as typeof fetch,
    );

    expect(result).toHaveLength(5);
    expect(result.map((candidate) => candidate.distanceMeters)).toEqual([
      8, 20, 30, 40, 50,
    ]);
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

  test("rejects candidates outside the 100 metre safety boundary", async () => {
    const fetcher = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        addresses: [
          {
            formattedAddress: "Testvej 1, 2100 København Ø",
            street: "Testvej",
            streetNumber: "1",
            postalCode: "2100",
            city: "København Ø",
            distanceMeters: 100.1,
          },
        ],
      }),
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

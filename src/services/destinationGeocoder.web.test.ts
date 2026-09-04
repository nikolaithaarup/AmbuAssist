import {
  normalizeDawaAddress,
  reverseGeocodeDestination,
} from "./destinationGeocoder.web";

describe("web destination geocoder", () => {
  test("normalizes DAWA mini addresses for shared destination routing", () => {
    expect(
      normalizeDawaAddress({
        betegnelse: "Frederiksberg Allé 13A, 1621 København V",
        vejnavn: "Frederiksberg Allé",
        husnr: "13A",
        postnr: "1621",
        postnrnavn: "København V",
      }),
    ).toMatchObject({
      street: "Frederiksberg Allé",
      name: "13A",
      postalCode: "1621",
      city: "København V",
      isoCountryCode: "DK",
    });
  });

  test("sends longitude as x and latitude as y", async () => {
    const fetcher = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        betegnelse: "Slotsgade 10, 3400 Hillerød",
        vejnavn: "Slotsgade",
        husnr: "10",
        postnr: "3400",
        postnrnavn: "Hillerød",
      }),
    });

    await expect(
      reverseGeocodeDestination(
        { latitude: 55.93, longitude: 12.3 },
        fetcher as typeof fetch,
      ),
    ).resolves.toHaveLength(1);

    const calledUrl = new URL(fetcher.mock.calls[0][0]);
    expect(calledUrl.searchParams.get("x")).toBe("12.3");
    expect(calledUrl.searchParams.get("y")).toBe("55.93");
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
});

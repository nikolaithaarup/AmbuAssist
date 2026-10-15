import { Buffer } from "node:buffer";

import {
  DestinationProviderAuthError,
  DestinationProviderError,
  projectToEtrs89Utm32,
  resetDestinationGeocoderTokenCacheForTests,
  reverseGeocodeCandidatesWithDar,
  reverseGeocodeWithDar,
} from "./destinationGeocoder";

const coordinates = { latitude: 55.6761, longitude: 12.5683 };
const credentials = { clientId: "test-client", clientSecret: "test-secret" };

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function addressPoint(id: string, eastOffset: number, northOffset = 0) {
  const [east, north] = projectToEtrs89Utm32(coordinates);
  return {
    id_lokalId: id,
    position: {
      wkt: `SRID=25832;POINT (${east + eastOffset} ${north + northOffset})`,
    },
  };
}

function houseNumber(address: string, number: string) {
  return {
    data: {
      DAR_Husnummer: {
        nodes: [
          {
            adgangsadressebetegnelse: address,
            husnummertekst: number,
          },
        ],
      },
    },
  };
}

describe("Datafordeler DAR destination geocoder", () => {
  beforeEach(() => resetDestinationGeocoderTokenCacheForTests());

  test("uses DAR v3 with OAuth and an EPSG:25832 search and distance boundary", async () => {
    const fetcher = jest
      .fn()
      .mockResolvedValueOnce(
        response({ access_token: "short-lived-token", expires_in: 3600 }),
      )
      .mockResolvedValueOnce(
        response({
          data: { DAR_Adressepunkt: { nodes: [addressPoint("point-1", 6)] } },
        }),
      )
      .mockResolvedValueOnce(
        response(
          houseNumber(
            "Frederiksberg Allé 13A, 1621 København V",
            "13A",
          ),
        ),
      );

    await expect(
      reverseGeocodeWithDar(coordinates, credentials, fetcher),
    ).resolves.toMatchObject({
      street: "Frederiksberg Allé",
      streetNumber: "13A",
      postalCode: "1621",
      city: "København V",
      distanceMeters: expect.any(Number),
    });

    const [authUrl, authOptions] = fetcher.mock.calls[0];
    expect(authUrl).toBe(
      "https://auth.datafordeler.dk/realms/distribution/protocol/openid-connect/token",
    );
    expect(authUrl).not.toContain(credentials.clientId);
    expect(authUrl).not.toContain(credentials.clientSecret);
    expect(authOptions.headers.Authorization).toBe(
      `Basic ${Buffer.from("test-client:test-secret", "utf8").toString("base64")}`,
    );
    const authBody = new URLSearchParams(String(authOptions.body));
    expect(authBody.get("grant_type")).toBe("client_credentials");
    expect(authBody.has("client_id")).toBe(false);
    expect(authBody.has("client_secret")).toBe(false);

    const [queryUrl, queryOptions] = fetcher.mock.calls[1];
    expect(queryUrl).toBe("https://graphql.datafordeler.dk/DAR/v3");
    expect(queryUrl).not.toContain(credentials.clientId);
    expect(queryUrl).not.toContain(credentials.clientSecret);
    expect(queryOptions.headers.Authorization).toBe("Bearer short-lived-token");
    const queryBody = JSON.parse(String(queryOptions.body));
    expect(queryBody.query).toContain("position: { within:");
    expect(queryBody.query).toContain("crs: 25832");
    expect(queryBody.variables.area).toMatch(/^POLYGON\(\(/u);
    expect(queryBody.variables.area).not.toContain(credentials.clientSecret);
    const polygonNumbers = queryBody.variables.area
      .match(/-?\d+(?:\.\d+)?/gu)
      ?.map(Number);
    expect(polygonNumbers).toHaveLength(10);
    const [easting, northing] = projectToEtrs89Utm32(coordinates);
    expect(polygonNumbers).toEqual([
      easting - 120,
      northing - 120,
      easting + 120,
      northing - 120,
      easting + 120,
      northing + 120,
      easting - 120,
      northing + 120,
      easting - 120,
      northing - 120,
    ]);
  });

  test("rejects invalid OAuth credentials", async () => {
    const fetcher = jest.fn().mockResolvedValue(response({}, 401));
    await expect(
      reverseGeocodeWithDar(coordinates, credentials, fetcher),
    ).rejects.toBeInstanceOf(DestinationProviderAuthError);
  });

  test("reports an unavailable DAR service", async () => {
    const fetcher = jest
      .fn()
      .mockResolvedValueOnce(
        response({ access_token: "token", expires_in: 3600 }),
      )
      .mockResolvedValueOnce(response({}, 503));
    await expect(
      reverseGeocodeWithDar(coordinates, credentials, fetcher),
    ).rejects.toBeInstanceOf(DestinationProviderError);
  });

  test("does not choose between distinct near-equal address candidates", async () => {
    const fetcher = jest
      .fn()
      .mockResolvedValueOnce(
        response({ access_token: "token", expires_in: 3600 }),
      )
      .mockResolvedValueOnce(
        response({
          data: {
            DAR_Adressepunkt: {
              nodes: [addressPoint("point-1", 8), addressPoint("point-2", 12)],
            },
          },
        }),
      )
      .mockResolvedValueOnce(
        response(houseNumber("Testvej 1, 2100 København Ø", "1")),
      )
      .mockResolvedValueOnce(
        response(houseNumber("Andenvej 2, 2100 København Ø", "2")),
      );

    await expect(
      reverseGeocodeWithDar(coordinates, credentials, fetcher),
    ).resolves.toBeNull();
  });

  test("returns distinct valid candidates sorted by distance for explicit selection", async () => {
    const fetcher = jest
      .fn()
      .mockResolvedValueOnce(
        response({ access_token: "token", expires_in: 3600 }),
      )
      .mockResolvedValueOnce(
        response({
          data: {
            DAR_Adressepunkt: {
              nodes: [addressPoint("point-2", 12), addressPoint("point-1", 8)],
            },
          },
        }),
      )
      .mockResolvedValueOnce(
        response(houseNumber("Testvej 1, 2100 København Ø", "1")),
      )
      .mockResolvedValueOnce(
        response(houseNumber("Andenvej 2, 2100 København Ø", "2")),
      );

    await expect(
      reverseGeocodeCandidatesWithDar(coordinates, credentials, fetcher),
    ).resolves.toMatchObject([
      { formattedAddress: "Testvej 1, 2100 København Ø", distanceMeters: 8 },
      { formattedAddress: "Andenvej 2, 2100 København Ø", distanceMeters: 12 },
    ]);
  });

  test("deduplicates repeated DAR addresses while keeping the nearest match", async () => {
    const fetcher = jest
      .fn()
      .mockResolvedValueOnce(
        response({ access_token: "token", expires_in: 3600 }),
      )
      .mockResolvedValueOnce(
        response({
          data: {
            DAR_Adressepunkt: {
              nodes: [addressPoint("point-1", 5), addressPoint("point-2", 15)],
            },
          },
        }),
      )
      .mockResolvedValueOnce(
        response(houseNumber("Testvej 1, 2100 København Ø", "1")),
      )
      .mockResolvedValueOnce(
        response(houseNumber("Testvej 1, 2100 København Ø", "1")),
      );

    await expect(
      reverseGeocodeCandidatesWithDar(coordinates, credentials, fetcher),
    ).resolves.toMatchObject([
      { formattedAddress: "Testvej 1, 2100 København Ø", distanceMeters: 5 },
    ]);
  });

  test("does not return an address outside the safe distance", async () => {
    const fetcher = jest
      .fn()
      .mockResolvedValueOnce(
        response({ access_token: "token", expires_in: 3600 }),
      )
      .mockResolvedValueOnce(
        response({
          data: { DAR_Adressepunkt: { nodes: [addressPoint("point-1", 110)] } },
        }),
      );

    await expect(
      reverseGeocodeWithDar(coordinates, credentials, fetcher),
    ).resolves.toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  test("does not choose when one address point maps to multiple addresses", async () => {
    const fetcher = jest
      .fn()
      .mockResolvedValueOnce(
        response({ access_token: "token", expires_in: 3600 }),
      )
      .mockResolvedValueOnce(
        response({
          data: { DAR_Adressepunkt: { nodes: [addressPoint("point-1", 5)] } },
        }),
      )
      .mockResolvedValueOnce(
        response({
          data: {
            DAR_Husnummer: {
              nodes: [
                {
                  adgangsadressebetegnelse: "Testvej 1, 2100 København Ø",
                  husnummertekst: "1",
                },
                {
                  adgangsadressebetegnelse: "Testvej 2, 2100 København Ø",
                  husnummertekst: "2",
                },
              ],
            },
          },
        }),
      );

    await expect(
      reverseGeocodeWithDar(coordinates, credentials, fetcher),
    ).resolves.toBeNull();
  });

  test("propagates network failures without returning a guessed address", async () => {
    const fetcher = jest.fn().mockRejectedValue(new TypeError("network down"));
    await expect(
      reverseGeocodeWithDar(coordinates, credentials, fetcher),
    ).rejects.toThrow("network down");
  });
});

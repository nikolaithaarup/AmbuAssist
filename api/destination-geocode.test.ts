import handler from "./destination-geocode";
import { reverseGeocodeWithDar } from "../src/server/destinationGeocoder";

jest.mock("../src/server/destinationGeocoder", () => ({
  reverseGeocodeWithDar: jest.fn(),
}));

const mockedReverseGeocode = jest.mocked(reverseGeocodeWithDar);
const originalClientId = process.env.DATAFORDELER_CLIENT_ID;
const originalClientSecret = process.env.DATAFORDELER_CLIENT_SECRET;

function request(
  headers: Record<string, string>,
  body: unknown = { latitude: 55.6761, longitude: 12.5683 },
): Request {
  return new Request("https://ambuassist.synapsestudio.dk/api/destination-geocode", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

describe("destination geocoder API boundary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DATAFORDELER_CLIENT_ID = "configured-client";
    process.env.DATAFORDELER_CLIENT_SECRET = "configured-secret";
  });

  afterAll(() => {
    process.env.DATAFORDELER_CLIENT_ID = originalClientId;
    process.env.DATAFORDELER_CLIENT_SECRET = originalClientSecret;
  });

  test("rejects requests without a matching browser origin", async () => {
    const response = await handler(
      request({ "Content-Type": "application/json" }),
    );
    expect(response.status).toBe(403);
    expect(mockedReverseGeocode).not.toHaveBeenCalled();
  });

  test("rejects cross-site fetch metadata even when Origin is spoofed", async () => {
    const response = await handler(
      request({
        "Content-Type": "application/json",
        Origin: "https://ambuassist.synapsestudio.dk",
        "Sec-Fetch-Site": "cross-site",
      }),
    );
    expect(response.status).toBe(403);
    expect(mockedReverseGeocode).not.toHaveBeenCalled();
  });

  test("returns only the normalized lookup result to a same-origin request", async () => {
    mockedReverseGeocode.mockResolvedValue({
      street: "Testvej",
      streetNumber: "1",
      postalCode: "2100",
      city: "København Ø",
      formattedAddress: "Testvej 1, 2100 København Ø",
    });
    const response = await handler(
      request({
        "Content-Type": "application/json",
        Origin: "https://ambuassist.synapsestudio.dk",
        "Sec-Fetch-Site": "same-origin",
      }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      address: { formattedAddress: "Testvej 1, 2100 København Ø" },
    });
    expect(mockedReverseGeocode).toHaveBeenCalledWith(
      { latitude: 55.6761, longitude: 12.5683 },
      { clientId: "configured-client", clientSecret: "configured-secret" },
    );
  });

  test("does not leak provider authentication failures", async () => {
    mockedReverseGeocode.mockRejectedValue(new Error("credential detail"));
    const response = await handler(
      request({
        "Content-Type": "application/json",
        Origin: "https://ambuassist.synapsestudio.dk",
      }),
    );
    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: "provider_unavailable",
    });
  });
});

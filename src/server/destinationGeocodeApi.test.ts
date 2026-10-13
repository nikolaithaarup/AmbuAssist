import handler from "../../api/destination-geocode";
import { reverseGeocodeWithDar } from "./destinationGeocoder";

jest.mock("./destinationGeocoder", () => ({
  reverseGeocodeWithDar: jest.fn(),
}));

const mockedReverseGeocode = jest.mocked(reverseGeocodeWithDar);
const originalClientId = process.env.DATAFORDELER_CLIENT_ID;
const originalClientSecret = process.env.DATAFORDELER_CLIENT_SECRET;

function request(
  headers: Record<string, string>,
  body: unknown = { latitude: 55.6761, longitude: 12.5683 },
) {
  return {
    method: "POST",
    headers: {
      host: "ambuassist.synapsestudio.dk",
      "x-forwarded-proto": "https",
      ...Object.fromEntries(
        Object.entries(headers).map(([name, value]) => [name.toLowerCase(), value]),
      ),
    },
    body,
  };
}

function response() {
  const result = {
    body: undefined as unknown,
    headers: {} as Record<string, string>,
    statusCode: 200,
  };
  const adapter = {
    json(body: unknown) {
      result.body = body;
    },
    setHeader(name: string, value: string) {
      result.headers[name] = value;
    },
    status(code: number) {
      result.statusCode = code;
      return adapter;
    },
  };
  return { adapter, result };
}

async function invoke(headers: Record<string, string>, body?: unknown) {
  const { adapter, result } = response();
  await handler(request(headers, body), adapter);
  return result;
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
    const result = await invoke({ "Content-Type": "application/json" });
    expect(result.statusCode).toBe(403);
    expect(mockedReverseGeocode).not.toHaveBeenCalled();
  });

  test("rejects cross-site fetch metadata even when Origin is spoofed", async () => {
    const result = await invoke({
      "Content-Type": "application/json",
      Origin: "https://ambuassist.synapsestudio.dk",
      "Sec-Fetch-Site": "cross-site",
    });
    expect(result.statusCode).toBe(403);
    expect(mockedReverseGeocode).not.toHaveBeenCalled();
  });

  test("accepts a same-origin Node.js serverless request", async () => {
    mockedReverseGeocode.mockResolvedValue({
      street: "Testvej",
      streetNumber: "1",
      postalCode: "2100",
      city: "København Ø",
      formattedAddress: "Testvej 1, 2100 København Ø",
    });
    const result = await invoke({
      "Content-Type": "application/json",
      Origin: "https://ambuassist.synapsestudio.dk",
      "Sec-Fetch-Site": "same-origin",
    });
    expect(result.statusCode).toBe(200);
    expect(result.body).toMatchObject({
      address: { formattedAddress: "Testvej 1, 2100 København Ø" },
    });
    expect(mockedReverseGeocode).toHaveBeenCalledWith(
      { latitude: 55.6761, longitude: 12.5683 },
      { clientId: "configured-client", clientSecret: "configured-secret" },
    );
  });

  test("does not leak provider authentication failures", async () => {
    const log = jest.spyOn(console, "error").mockImplementation(() => undefined);
    mockedReverseGeocode.mockRejectedValue(new Error("credential detail"));
    const result = await invoke({
      "Content-Type": "application/json",
      Origin: "https://ambuassist.synapsestudio.dk",
    });
    expect(result.statusCode).toBe(502);
    expect(result.body).toEqual({ error: "provider_unavailable" });
    expect(log).toHaveBeenCalledWith("Destination geocoder request failed.", {
      category: "network",
      status: "unavailable",
    });
    expect(JSON.stringify(log.mock.calls)).not.toContain("credential detail");
    log.mockRestore();
  });
});

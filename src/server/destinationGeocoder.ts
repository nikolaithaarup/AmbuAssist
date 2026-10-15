import { Buffer } from "node:buffer";

import proj4 from "proj4";

import type {
  DestinationGeocodedAddress,
  ReverseGeocodeCoordinates,
} from "../services/destinationGeocoder.types";

const DATAFORDELER_ENDPOINT = "https://graphql.datafordeler.dk/DAR/v3";
const DATAFORDELER_AUTH_ENDPOINT =
  "https://auth.datafordeler.dk/realms/distribution/protocol/openid-connect/token";
const SEARCH_RADIUS_METERS = 120;
const MAXIMUM_ADDRESS_DISTANCE_METERS = 100;
const MAXIMUM_CANDIDATES = 100;
const MAXIMUM_RETURNED_ADDRESSES = 5;
const MAXIMUM_RESOLVED_POINTS = 10;

const WGS84 = "EPSG:4326";
const ETRS89_UTM32 =
  "+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs +type=crs";

const ADDRESS_POINT_QUERY = `
  query ReverseAddressPoints($time: DafDateTime!, $area: String!) {
    DAR_Adressepunkt(
      first: ${MAXIMUM_CANDIDATES}
      registreringstid: $time
      virkningstid: $time
      where: { position: { within: { wkt: $area, crs: 25832 } } }
    ) {
      nodes {
        id_lokalId
        position { wkt }
      }
    }
  }
`;

const HOUSE_NUMBER_QUERY = `
  query AddressForPoint($time: DafDateTime!, $pointId: String!) {
    DAR_Husnummer(
      first: 10
      registreringstid: $time
      virkningstid: $time
      where: { adgangspunkt: { eq: $pointId } }
    ) {
      nodes {
        adgangsadressebetegnelse
        husnummertekst
      }
    }
  }
`;

type GraphQlResponse<T> = {
  data?: T;
  errors?: Array<{ message?: unknown }>;
};

type AddressPointNode = {
  id_lokalId?: unknown;
  position?: { wkt?: unknown } | null;
};

type HouseNumberNode = {
  adgangsadressebetegnelse?: unknown;
  husnummertekst?: unknown;
};

export type DatafordelerCredentials = {
  clientId: string;
  clientSecret: string;
};

type CachedAccessToken = {
  clientId: string;
  value: string;
  expiresAt: number;
};

let cachedAccessToken: CachedAccessToken | null = null;
let accessTokenRequest: Promise<string> | null = null;

export class DestinationProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DestinationProviderError";
  }
}

export class DestinationProviderAuthError extends DestinationProviderError {
  constructor(message: string) {
    super(message);
    this.name = "DestinationProviderAuthError";
  }
}

function assertDanishCoordinates({
  latitude,
  longitude,
}: ReverseGeocodeCoordinates) {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < 54.4 ||
    latitude > 58.0 ||
    longitude < 7.5 ||
    longitude > 15.5
  ) {
    throw new DestinationProviderError("Coordinates are outside Denmark.");
  }
}

function searchPolygon({
  latitude,
  longitude,
}: ReverseGeocodeCoordinates): string {
  const [easting, northing] = projectToEtrs89Utm32({ latitude, longitude });
  const west = easting - SEARCH_RADIUS_METERS;
  const east = easting + SEARCH_RADIUS_METERS;
  const south = northing - SEARCH_RADIUS_METERS;
  const north = northing + SEARCH_RADIUS_METERS;
  return `POLYGON((${west} ${south},${east} ${south},${east} ${north},${west} ${north},${west} ${south}))`;
}

function parsePointWkt(value: unknown): [number, number] | null {
  if (typeof value !== "string") return null;
  const match = value.match(
    /^(?:SRID=\d+;)?POINT\s*(?:Z\s*)?\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/iu,
  );
  if (!match) return null;
  const x = Number(match[1]);
  const y = Number(match[2]);
  return Number.isFinite(x) && Number.isFinite(y) ? [x, y] : null;
}

function distanceMeters(a: [number, number], b: [number, number]): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

export function projectToEtrs89Utm32({
  latitude,
  longitude,
}: ReverseGeocodeCoordinates): [number, number] {
  const projected = proj4(WGS84, ETRS89_UTM32, [longitude, latitude]);
  return [projected[0], projected[1]];
}

export function parseDarAddress(
  formattedAddress: unknown,
  houseNumber: unknown,
  distance: number,
): DestinationGeocodedAddress | null {
  if (typeof formattedAddress !== "string") return null;
  const value = formattedAddress.trim();
  const parts = value.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return null;

  const locality = parts.at(-1)?.match(/^(\d{4})\s+(.+)$/u);
  const dedicatedHouseNumber =
    typeof houseNumber === "string" ? houseNumber.trim() : "";
  const streetPart = parts[0];
  const streetMatch = streetPart.match(/^(.*?)\s+(\d{1,4}\s*[A-ZÆØÅ]?)$/iu);
  const street = streetMatch?.[1]?.trim();
  const parsedHouseNumber = dedicatedHouseNumber || streetMatch?.[2]?.replace(/\s+/g, "");

  if (!locality || !street || !parsedHouseNumber) return null;

  return {
    city: locality[2].trim(),
    country: "Danmark",
    distanceMeters: distance,
    formattedAddress: value,
    isoCountryCode: "DK",
    name: parsedHouseNumber,
    postalCode: locality[1],
    street,
    streetNumber: parsedHouseNumber,
  };
}

async function getAccessToken(
  credentials: DatafordelerCredentials,
  fetcher: typeof fetch,
): Promise<string> {
  if (
    cachedAccessToken &&
    cachedAccessToken.clientId === credentials.clientId &&
    cachedAccessToken.expiresAt > Date.now() + 60_000
  ) {
    return cachedAccessToken.value;
  }
  if (accessTokenRequest) return accessTokenRequest;

  accessTokenRequest = (async () => {
    const body = new URLSearchParams({
      grant_type: "client_credentials",
    });
    const basicCredentials = Buffer.from(
      `${credentials.clientId}:${credentials.clientSecret}`,
      "utf8",
    ).toString("base64");
    const response = await fetcher(DATAFORDELER_AUTH_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${basicCredentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) {
      throw new DestinationProviderAuthError(
        `Datafordeler authentication returned HTTP ${response.status}.`,
      );
    }

    const payload = (await response.json()) as {
      access_token?: unknown;
      expires_in?: unknown;
    };
    if (typeof payload.access_token !== "string" || !payload.access_token) {
      throw new DestinationProviderAuthError(
        "Datafordeler authentication returned an invalid response.",
      );
    }
    const expiresIn =
      typeof payload.expires_in === "number" && payload.expires_in > 0
        ? payload.expires_in
        : 3_600;
    cachedAccessToken = {
      clientId: credentials.clientId,
      value: payload.access_token,
      expiresAt: Date.now() + expiresIn * 1_000,
    };
    return payload.access_token;
  })().finally(() => {
    accessTokenRequest = null;
  });
  return accessTokenRequest;
}

export function resetDestinationGeocoderTokenCacheForTests() {
  cachedAccessToken = null;
  accessTokenRequest = null;
}

async function queryDatafordeler<T>(
  accessToken: string,
  query: string,
  variables: Record<string, unknown>,
  fetcher: typeof fetch,
): Promise<T> {
  const response = await fetcher(DATAFORDELER_ENDPOINT, {
    method: "POST",
    headers: {
      Accept: "application/graphql-response+json",
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(8_000),
  });

  if (response.status === 401 || response.status === 403) {
    cachedAccessToken = null;
    throw new DestinationProviderAuthError(
      `Datafordeler rejected the access token with HTTP ${response.status}.`,
    );
  }
  if (!response.ok) {
    throw new DestinationProviderError(
      `Datafordeler returned HTTP ${response.status}.`,
    );
  }

  const payload = (await response.json()) as GraphQlResponse<T>;
  if (payload.errors?.length || !payload.data) {
    throw new DestinationProviderError("Datafordeler returned an invalid response.");
  }
  return payload.data;
}

export async function reverseGeocodeWithDar(
  coordinates: ReverseGeocodeCoordinates,
  credentials: DatafordelerCredentials,
  fetcher: typeof fetch = fetch,
): Promise<DestinationGeocodedAddress | null> {
  const candidates = await reverseGeocodeCandidatesWithDar(
    coordinates,
    credentials,
    fetcher,
  );
  return candidates.length === 1 ? candidates[0] : null;
}

export async function reverseGeocodeCandidatesWithDar(
  coordinates: ReverseGeocodeCoordinates,
  credentials: DatafordelerCredentials,
  fetcher: typeof fetch = fetch,
): Promise<DestinationGeocodedAddress[]> {
  assertDanishCoordinates(coordinates);
  if (!credentials.clientId.trim() || !credentials.clientSecret.trim()) {
    throw new DestinationProviderAuthError(
      "Datafordeler OAuth credentials are missing.",
    );
  }

  const time = new Date().toISOString();
  const accessToken = await getAccessToken(credentials, fetcher);
  const pointData = await queryDatafordeler<{
    DAR_Adressepunkt?: { nodes?: AddressPointNode[] | null } | null;
  }>(accessToken, ADDRESS_POINT_QUERY, { time, area: searchPolygon(coordinates) }, fetcher);

  const requestedPoint = projectToEtrs89Utm32(coordinates);
  const candidates = (pointData.DAR_Adressepunkt?.nodes ?? [])
    .map((node) => {
      const id = typeof node.id_lokalId === "string" ? node.id_lokalId : null;
      const point = parsePointWkt(node.position?.wkt);
      return id && point
        ? { id, distance: distanceMeters(requestedPoint, point) }
        : null;
    })
    .filter((candidate): candidate is { id: string; distance: number } => !!candidate)
    .sort((a, b) => a.distance - b.distance);

  const nearbyCandidates = candidates
    .filter((candidate) => candidate.distance <= MAXIMUM_ADDRESS_DISTANCE_METERS)
    .slice(0, MAXIMUM_RESOLVED_POINTS);
  if (!nearbyCandidates.length) return [];

  const addressForCandidate = async (candidate: {
    id: string;
    distance: number;
  }) => {
    const houseData = await queryDatafordeler<{
      DAR_Husnummer?: { nodes?: HouseNumberNode[] | null } | null;
    }>(
      accessToken,
      HOUSE_NUMBER_QUERY,
      { time, pointId: candidate.id },
      fetcher,
    );
    const addresses = (houseData.DAR_Husnummer?.nodes ?? [])
      .map((node) =>
        parseDarAddress(
          node.adgangsadressebetegnelse,
          node.husnummertekst,
          candidate.distance,
        ),
      )
      .filter(
        (address): address is DestinationGeocodedAddress => address !== null,
      );
    const uniqueAddresses = new Map(
      addresses.map((address) => [address.formattedAddress, address]),
    );
    return [...uniqueAddresses.values()];
  };

  const uniqueAddresses = new Map<string, DestinationGeocodedAddress>();
  const resolvedCandidates = await Promise.all(
    nearbyCandidates.map((candidate) => addressForCandidate(candidate)),
  );
  for (const addresses of resolvedCandidates) {
    for (const address of addresses) {
      const key = address.formattedAddress
        ?.normalize("NFKC")
        .toLocaleLowerCase("da-DK")
        .replace(/\s+/gu, " ")
        .trim();
      if (!key || uniqueAddresses.has(key)) continue;
      uniqueAddresses.set(key, address);
      if (uniqueAddresses.size >= MAXIMUM_RETURNED_ADDRESSES) {
        return [...uniqueAddresses.values()];
      }
    }
  }

  return [...uniqueAddresses.values()].sort(
    (a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity),
  );
}

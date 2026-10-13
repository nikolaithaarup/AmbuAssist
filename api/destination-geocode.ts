import { reverseGeocodeWithDar } from "../src/server/destinationGeocoder";

type HeaderValue = string | string[] | undefined;

type VercelRequestLike = {
  body?: unknown;
  headers: Record<string, HeaderValue>;
  method?: string;
};

type VercelResponseLike = {
  json(body: unknown): void;
  setHeader(name: string, value: string): void;
  status(code: number): VercelResponseLike;
};

function header(request: VercelRequestLike, name: string): string | undefined {
  const value = request.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

function json(
  response: VercelResponseLike,
  body: unknown,
  status: number,
): void {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Security-Policy", "default-src 'none'");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.status(status).json(body);
}

function isSameOrigin(request: VercelRequestLike): boolean {
  const origin = header(request, "origin");
  const host = header(request, "x-forwarded-host") ?? header(request, "host");
  const protocol = header(request, "x-forwarded-proto") ?? "https";
  if (!origin || !host || origin !== `${protocol}://${host}`) return false;

  const fetchSite = header(request, "sec-fetch-site");
  return !fetchSite || fetchSite === "same-origin";
}

function requestBody(request: VercelRequestLike): unknown {
  if (typeof request.body === "string") return JSON.parse(request.body);
  return request.body;
}

export default async function handler(
  request: VercelRequestLike,
  response: VercelResponseLike,
): Promise<void> {
  if (request.method !== "POST") {
    json(response, { error: "method_not_allowed" }, 405);
    return;
  }
  if (!isSameOrigin(request)) {
    json(response, { error: "forbidden_origin" }, 403);
    return;
  }
  if (!header(request, "content-type")?.startsWith("application/json")) {
    json(response, { error: "invalid_content_type" }, 415);
    return;
  }

  let body: unknown;
  try {
    body = requestBody(request);
  } catch {
    json(response, { error: "invalid_request" }, 400);
    return;
  }

  const latitude = Number((body as Record<string, unknown>)?.latitude);
  const longitude = Number((body as Record<string, unknown>)?.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    json(response, { error: "invalid_coordinates" }, 400);
    return;
  }

  const clientId = process.env.DATAFORDELER_CLIENT_ID ?? "";
  const clientSecret = process.env.DATAFORDELER_CLIENT_SECRET ?? "";
  if (!clientId || !clientSecret) {
    json(response, { error: "provider_not_configured" }, 503);
    return;
  }

  try {
    const address = await reverseGeocodeWithDar(
      { latitude, longitude },
      { clientId, clientSecret },
    );
    json(response, { address }, 200);
  } catch {
    json(response, { error: "provider_unavailable" }, 502);
  }
}

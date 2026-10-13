import { reverseGeocodeWithDar } from "../src/server/destinationGeocoder";

function json(body: unknown, status: number): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Security-Policy": "default-src 'none'",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const sameOrigin = origin === new URL(request.url).origin;
    const fetchSite = request.headers.get("sec-fetch-site");
    return sameOrigin && (!fetchSite || fetchSite === "same-origin");
  } catch {
    return false;
  }
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!isSameOrigin(request)) return json({ error: "forbidden_origin" }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return json({ error: "invalid_content_type" }, 415);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_request" }, 400);
  }

  const latitude = Number((body as Record<string, unknown>)?.latitude);
  const longitude = Number((body as Record<string, unknown>)?.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return json({ error: "invalid_coordinates" }, 400);
  }

  const clientId = process.env.DATAFORDELER_CLIENT_ID ?? "";
  const clientSecret = process.env.DATAFORDELER_CLIENT_SECRET ?? "";
  if (!clientId || !clientSecret) {
    return json({ error: "provider_not_configured" }, 503);
  }

  try {
    const address = await reverseGeocodeWithDar(
      { latitude, longitude },
      { clientId, clientSecret },
    );
    return json({ address }, 200);
  } catch {
    return json({ error: "provider_unavailable" }, 502);
  }
}

# AmbuAssist web runtime and security notes

## Build and hosting contract

Expo Router uses static web output. Its canonical origin is configured with
`EXPO_PUBLIC_APP_ORIGIN` and defaults to
`https://ambuassist.synapsestudio.dk`. Run `npm run web:export`; publish
`dist/` and configure the host to serve generated route files/directories for deep URLs.
The deployment should use HTTPS, immutable caching for fingerprinted assets, and
no-cache/revalidation for HTML. No deployment or DNS change is included here.

Recommended hosting is a static host/CDN that supports clean Expo Router paths,
custom response headers, preview deployments, and atomic rollback. Vercel or
Cloudflare Pages are suitable; Firebase Hosting is also coherent with the
existing Firebase project. Prefer the platform already operated by SynapseStudio.

## Public build-time configuration

Optional Expo public variables:

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `EXPO_PUBLIC_APP_ORIGIN`
- `EXPO_PUBLIC_PORTAL_SESSION_URL`
- `EXPO_PUBLIC_PORTAL_LOGIN_URL`
- `EXPO_PUBLIC_PORTAL_USAGE_URL`

The checked-in Firebase client defaults are public project identifiers, not
credentials. Never put service accounts, Firebase Admin credentials, private
geocoder keys, session secrets, or access tokens in `EXPO_PUBLIC_*`; Expo embeds
those values in the browser bundle.

`EXPO_PUBLIC_APP_ORIGIN` must be an HTTPS origin without a path, query,
credentials, or fragment. HTTP is accepted only for loopback local development.

## Location and storage

Native reverse geocoding remains in `destinationGeocoder.native.ts`. Web posts
coordinates to the same-origin `/api/destination-geocode` function. That
server-side function exchanges Datafordeler OAuth client credentials for a
short-lived bearer token and queries the official DAR GraphQL service. The
credentials and bearer token are never embedded in browser JavaScript or put in
request URLs.

Production requires these server-only Vercel variables:

- `DATAFORDELER_CLIENT_ID`
- `DATAFORDELER_CLIENT_SECRET`

Create a Datafordeler Administration user, create an IT system, and select its
OAuth Shared Secret authentication method. Store that IT system's Client ID and
Client Secret in the AmbuAssist Vercel project's Production environment. Do not
prefix either name with `EXPO_PUBLIC_`.

The lookup uses a DAR `Adressepunkt` spatial `within` filter in EPSG:4326, while
DAR returns address-point WKT in EPSG:25832. The server converts the requested
coordinate to EPSG:25832 before measuring distance. It resolves the selected
point through `DAR_Husnummer.adgangspunkt` and consumes
`adgangsadressebetegnelse` and `husnummertekst`. Results over 100 metres away,
multiple addresses for one point, or distinct near-equal candidates are rejected
instead of being passed to clinical routing.

Coordinates are held in component memory for the active lookup and are not
written to AsyncStorage/localStorage. Browser geolocation still requires HTTPS
and user permission. Provider failure, offline state, timeout, permission denial,
disabled services, and unsafe accuracy all keep manual address and hospital
fallbacks available.

Small non-clinical preferences may remain in AsyncStorage's web backing store.
Do not persist Portal tokens, GPS coordinates, clinical inputs/results, or
patient identifiers there. If later offline clinical data is approved, use an
explicitly threat-modelled IndexedDB design with retention, encryption/key
management, logout purge, migration, and incident requirements.

## Browser bundle controls still required before production

- Replace the checked-in deny-all Firestore Security Rules with an approved,
  least-privilege production model. Initial staging intentionally relies on the
  bundled visitation, reference, and phone-number fallbacks.
- Decide whether Firebase App Check is required and configure its web provider.
- Review and harden the checked-in CSP and security headers for production.
- Ensure source maps and error telemetry cannot disclose clinical inputs,
  identity data, coordinates, or configuration beyond public identifiers.
- Perform dependency/SBOM and license scanning in CI.

## PWA and offline status

The static web build now includes an install manifest and a minimal service
worker. The worker activates updates immediately and caches only fingerprinted
`/_expo/static/` and `/assets/` files. It deliberately does not cache HTML,
Portal/API responses, navigation requests, clinical inputs, GPS results, or
destination searches. New clinical/reference content therefore requires a
network-loaded current page; the PWA does not claim a stale offline clinical
experience.

The current in-memory page can continue using already loaded fingerprinted
assets during a transient connection loss. Full offline navigation remains out
of scope until clinical content ownership, freshness and rollback rules are
approved.

## Usage statistics boundary

The browser sends only one aggregate `open` marker per authorized page document
and an allow-listed tool identifier when a clinical tool route is opened. The
payload cannot contain extra fields. It never includes account identity,
clinical values/results, medication data, free text, addresses, searches or GPS
coordinates. Failure is silent and never blocks a clinical workflow.

Portal authenticates and rechecks the active AmbuAssist entitlement before
accepting a marker. See Portal's `docs/AMBUASSIST_USAGE_STATISTICS.md` for the
aggregate storage, administrator access and retention contract.

## Self-service sign-in

Use the environment-specific AmbuAssist origin as the normal entry point.
EXPO_PUBLIC_PORTAL_LOGIN_URL should point to Portal's /auth/ambuassist route.
Portal redirects that route to the existing manual /login flow while
AMBUASSIST_SELF_SERVICE_ENABLED is false.

entry.js captures the initial URL before Expo Router initializes. The web auth gate
does not mount a protected navigator until Portal authorizes access. The captured
path, query and fragment are sent as returnTo; a small history restoration handles
Expo 54 serializing a fragment before its query. No authentication or return state
is stored in localStorage. Foreground and expiry checks repeat the server lookup.

See the Portal repository's docs/AMBUASSIST_SELF_SERVICE.md for the migration,
Firebase console prerequisites, complete staging enablement and rollback procedure.

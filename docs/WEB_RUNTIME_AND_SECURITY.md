# AmbuAssist web runtime and security notes

## Build and hosting contract

Expo Router uses static web output with production origin
`https://ambuassist.synapsestudio.dk`. Run `npm run web:export`; publish `dist/`
and configure the host to serve generated route files/directories for deep URLs.
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
- `EXPO_PUBLIC_PORTAL_SESSION_URL`
- `EXPO_PUBLIC_PORTAL_LOGIN_URL`
- `EXPO_PUBLIC_DESTINATION_GEOCODER_URL`

The checked-in Firebase client defaults are public project identifiers, not
credentials. Never put service accounts, Firebase Admin credentials, private
geocoder keys, session secrets, or access tokens in `EXPO_PUBLIC_*`; Expo embeds
those values in the browser bundle.

## Location and storage

Native reverse geocoding remains in `destinationGeocoder.native.ts`. Web uses
the public Danish DAWA reverse endpoint by default and normalizes its mini result
to the same shared address shape. A replacement endpoint may use the override
variable but must accept `x=<longitude>`, `y=<latitude>`, and `struktur=mini`, and
return DAWA mini-compatible JSON without a browser secret.

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

- Review and deploy least-privilege Firestore Security Rules; rules are not in
  this repository and cannot be verified here.
- Decide whether Firebase App Check is required and configure its web provider.
- Add production CSP, Permissions-Policy (especially geolocation),
  Referrer-Policy, HSTS, frame-ancestors, and MIME-sniffing protections.
- Ensure source maps and error telemetry cannot disclose clinical inputs,
  identity data, coordinates, or configuration beyond public identifiers.
- Perform dependency/SBOM and license scanning in CI.

## PWA and offline status

Static output and responsive layout prepare the app for a later PWA phase. No
service worker, install manifest, background sync, or clinical-data cache is
implemented here. Phase 4 must define update behavior and prevent stale clinical
guidance before adding offline caching or installability.

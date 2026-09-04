# SynapsePortal → AmbuAssist access contract

## Scope

SynapsePortal is not present in this repository. AmbuAssist therefore contains
only a consumer boundary. It does not duplicate Portal accounts, passwords,
session issuance, entitlement administration, or email-domain policy.

The web app authorizes a route only after Portal returns a valid session with an
active, explicit `ambuassist` entitlement. BAM-ID is optional profile metadata
and cannot grant web access.

## Required endpoint

Default URL:

`GET https://portal.synapsestudio.dk/api/auth/product-session`

It can be overridden at build time with
`EXPO_PUBLIC_PORTAL_SESSION_URL`. The browser request uses
`credentials: include` and `Accept: application/json`.

Portal must:

- authenticate its own secure, HTTP-only session cookie;
- permit credentialed CORS only from
  `https://ambuassist.synapsestudio.dk` (and explicitly approved development
  origins);
- return `Cache-Control: no-store` and `Vary: Origin`;
- reject unknown origins and never expose a bearer/session token to JavaScript;
- calculate entitlements centrally instead of relying on client email-domain
  checks.

Successful response (`200 application/json`):

```json
{
  "user": {
    "id": "stable-portal-user-id",
    "email": "user@example.dk",
    "emailVerified": true,
    "displayName": "Optional display name",
    "bamId": "ABCD1234"
  },
  "entitlements": {
    "ambuassist": {
      "granted": true,
      "source": "role",
      "expiresAt": null
    },
    "ppj": { "granted": false },
    "facilitator": { "granted": false },
    "admin": { "granted": false }
  },
  "expiresAt": "2026-08-30T12:00:00.000Z"
}
```

AmbuAssist accepts additional entitlement keys for future products. Every value
must remain an object with an explicit `granted` boolean. `expiresAt`, when set,
must be an ISO timestamp. An expired AmbuAssist entitlement is denied locally.

Responses:

- `200`: authenticated session; AmbuAssist validates the response and the
  entitlement.
- `401`: no valid Portal session; AmbuAssist shows the Portal sign-in action.
- `403`: authenticated but Portal denies AmbuAssist; AmbuAssist shows an access
  request/denial state.
- `5xx` or invalid/network response: retryable boundary error; access stays
  closed.

## Login and return flow

Default login URL:

`https://portal.synapsestudio.dk/login?returnTo=<absolute AmbuAssist URL>`

It can be overridden with `EXPO_PUBLIC_PORTAL_LOGIN_URL`. Portal must validate
`returnTo` against an exact allow-list; at minimum allow the AmbuAssist production
origin and reject protocol-relative, non-HTTPS, or untrusted destinations. After
sign-in, Portal redirects to the original AmbuAssist path. AmbuAssist then calls
the session endpoint again.

## Security boundary

The Expo Router gate prevents unauthorized UI and protected deep-link rendering.
It is not authorization for Firestore or any future API. Each data backend must
independently verify the Portal identity/entitlement or expose only intentionally
public data. Firestore Security Rules and App Check require a separate deployment
review because neither configuration is present in this repository.

Portal cookies should remain host-only for `portal.synapsestudio.dk`; the
credentialed same-site cross-origin request avoids a broad
`.synapsestudio.dk` cookie. Use `Secure`, `HttpOnly`, an appropriate `SameSite`
value, CSRF protections, short session expiry, and session revocation.

## BAM-ID

If Portal supplies `user.bamId`, it is display/profile metadata. Portal decides
how it is verified and edited. AmbuAssist never treats its format, presence, or
value as proof of identity or entitlement. The current native app retains its
local BAM profile temporarily with assurance level `legacy-native-profile`.

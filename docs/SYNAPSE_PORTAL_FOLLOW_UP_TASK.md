# Portal repository follow-up: AmbuAssist product entitlement

Implement the Portal side of the contract in
`SYNAPSE_PORTAL_AMBUASSIST_CONTRACT.md`.

## Acceptance criteria

1. Add `ambuassist` to Portal's typed product-entitlement model alongside the
   future-safe `ppj`, `facilitator`, and `admin` keys.
2. Add an authenticated `GET /api/auth/product-session` endpoint that returns
   the exact documented response and status codes. Entitlements are calculated
   server-side; no email-domain authorization runs in AmbuAssist.
3. Return only verified Portal identity data. Include BAM-ID only as optional
   metadata and never as an authentication factor.
4. Configure credentialed CORS for the exact production AmbuAssist origin and
   explicitly listed local preview origins. Add `Cache-Control: no-store` and
   `Vary: Origin`.
5. Keep the Portal session in a secure, HTTP-only, host-only cookie. Do not send
   a bearer token to AmbuAssist or require localStorage.
6. Update Portal login to accept a strictly allow-listed absolute `returnTo`,
   preserve the AmbuAssist deep path, and redirect there after successful login.
7. Provide entitlement management UI/audit logging for grants, revocations,
   source, and optional expiry. Decide and document who can administer it.
8. Add tests for 200 authorized, 200 without entitlement, expired entitlement,
   401, forbidden origin, invalid return URL, revoked session, and optional BAM
   metadata.
9. Confirm the production endpoint URL and cookie/CORS behavior to the
   AmbuAssist team so its build-time URLs can be locked.

Do not add Portal password handling, user replication, or duplicate entitlement
storage to AmbuAssist.

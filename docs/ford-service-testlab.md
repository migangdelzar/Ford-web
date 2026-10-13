# Ford-web ↔ Ford-service integration status

Ford-service owns operator auth and token issuance. Spring Security handles
passkeys, password login, and one-time email recovery. Browser identity lives
in a Redis-backed Spring session; the browser receives only an opaque HttpOnly
cookie. Validated bearer JWTs remain available for service clients.

## Current application behavior

- Login uses same-origin Spring routes. Passkey success returns to the CRM; the
  UI no longer starts the BFF OAuth callback flow.
- `/api/auth/me`, `/api/auth/logout`, and `/api/auth/csrf` use Spring Security.
- Unsafe browser requests include `X-XSRF-TOKEN`; bearer JWT requests remain
  stateless and do not need a CSRF cookie.
- Spring reloads active operator roles and tenant memberships from PostgreSQL
  on each CRM API request, so an account disable or membership change takes
  effect without waiting for a stale browser session to expire.
- Inbox reads, messages, handoffs, and operator event streams use Ford-service.
- Spring serves the UI through its reverse proxy to the static Pages app.

## Runtime ownership

Ford-service is the only application backend container. It owns browser
authentication, operator APIs, webhooks, and the reverse proxy to the static
Pages UI. Ford-web does not build or publish a separate BFF image. Keep the
OpenTelemetry Collector.

For Pages preview, the function forwards approved auth/API routes to its
configured `FORD_ORIGIN_URL`, which must reach Ford-service. The final public
UI uses `ford.emme.business`; `/webhooks/meta/**` also reaches Ford-service.

## Current limits

- Some CRM screens still contain demo data or simulator-only mutations; do not
  present those as live backend capabilities.
- Production Tunnel/DNS and Pages settings have not been cut over by this code
  change. DNS requires Cloudflare Zone DNS Edit access.
- No production deployment or external Cloudflare setting is claimed by this
  document.

## Local setup

Configure Ford-service's server-side database, Redis, auth signing key, passkey
origin, and Resend variables. Set `FORD_WEB_UI_UPSTREAM_URL` to the static Pages
deployment. Do not put credentials, signing keys, or Resend secrets in `VITE_*`
variables. Run `npm run pages:check` to compile the Pages Function and
`npm run api:check -- <Ford-service frontend-api.yaml path>` to verify the UI
contract.

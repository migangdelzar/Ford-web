# Ford-web ↔ Ford-service integration status

Ford-service owns operator authentication and issues the OAuth/OIDC tokens. Ford-web acts as the browser-facing BFF: it stores tokens in Redis, exposes an HTTP-only session cookie, and forwards same-origin requests. Passkeys are the primary sign-in method; Spring Security one-time email tokens are the recovery path.

## Connected flows

- Login start and callback use authorization-code flow with PKCE and server-side login state.
- The email recovery link first enters the same OAuth authorization flow as passkey sign-in, preserving Spring’s saved authorization request; Spring’s generated OTT page handles requesting and submitting the one-time link.
- The BFF reads the operator profile from `/api/v1/operator/me`; the UI never trusts a browser-supplied role or bearer token.
- CSRF-protected email recovery and logout relay requests to Spring Security. Logout invalidates the Spring session and the BFF session.
- Test Lab sends structured multi-turn requests to `/api/v1/ai/respond`; its conversation ID is scoped in browser storage by operator identity.
- Inbox reads tenant-scoped conversation/message pages from Ford-service and renders an explicit branch selector for operators with multiple tenant memberships.
- Inbox replies, takeover, and handback use Ford-service commands; sends carry idempotency and conversation-version headers, while handback uses the active handoff ticket version.
- Operator event streaming uses `/api/v1/operator/events/stream` through the same-origin BFF.
- A Cloudflare Pages Function now routes only `/api/*`, `/oauth2/*`, `/.well-known/*`, `/login/*`, and `/webauthn/*` to the configured origin. It replaces forwarded-host headers, strips browser Authorization, and rewrites internal redirects to the public host.

## Important limits

- Other inbox mutations (lead fields, reassignment, local read markers, and simulated customer messages) still need backend wiring or removal from live mode before the CRM is production-ready.
- Metrics, leads, inventory, finance, appointments, advisors, bot configuration, and actuator screens are not yet migrated as a complete UI flow. Do not treat their existing demo content or simulator actions as live backend data.
- The Pages Function requires server-side `FORD_ORIGIN_URL` to point at a reverse proxy that routes `/api/**` to Ford-web BFF and Spring auth/OIDC paths to Ford-service. That binding and Tunnel route are not configured or verified here; passkey-origin behavior still needs a temporary-host end-to-end run.
- No production DNS, Cloudflare Pages, Tunnel, or emme-1 deployment was changed as part of this work.

## Local setup

Set the server-only BFF variables listed in `.env.example`, point `FORD_BFF_URL` at the BFF from the development UI server, and configure the Spring issuer, OAuth client, matching redirect URI, and allowed passkey origin for the chosen test host. The BFF needs Redis. Never place OAuth credentials, access tokens, signing keys, or the Resend API key in `VITE_*` variables.

For Pages, bind `FORD_ORIGIN_URL` as a server-side Pages variable to the reverse proxy origin; do not set it to the public Pages hostname. Run `bun run pages:check` to compile the Function locally.

The integration requires an actual operator identity and assigned tenant. `FORD_RESEND_API_KEY` is read from the server environment; set `RESEND_FROM` to a verified sender address too. A request for an unknown recovery email should keep the neutral accepted response; use a test identity and fake email sender for automated checks.

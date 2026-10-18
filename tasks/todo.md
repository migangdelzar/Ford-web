# MÍA Ford Uruapan Phase 1 — Ford-web

## BDC in-app after-hours digest (2026-10-18)

Approved behavior/design: see Ford Service `docs/superpowers/specs/2026-10-18-bdc-after-hours-digest-design.md` and `docs/superpowers/plans/2026-10-18-bdc-after-hours-digest.md`. Ford-web is the in-app delivery surface; no external alerts.

- [x] Add a typed same-origin authenticated BFF client for Service's tenant-scoped digest GET endpoint.
- [x] Add an inbox card showing business date/08:45 availability, ticket counts, packet completeness, and links into existing conversations; if the inbox is already open before 08:45, it refreshes when the server-reported availability timestamp arrives.
- [x] Test ready, pre-availability, empty, retry, partial-packet, and active-tenant-change states; errors stay inside the card and do not block the inbox.
- [x] Run full Ford-web tests (35 files / 143 passed), lint, production build, OpenAPI contract check (50 paths), and Pages function build. Protected preview/production verification remains open.
- [ ] Production 08:45 verification remains open until approved holiday/calendar configuration, protected release, and operator dry-run are available.

Ford-web is the locally hosted CRM application for the Ford Uruapan workflow. CRM functionality belongs in this app and its locally operated Ford Service backend; the plan does not call for integrating a separate external CRM provider.

## Shadow draft review in the inbox

- [x] Add a tenant-scoped client for listing unsent shadow drafts and annotating an advisor's accept/reject decision through Ford Service.
- [x] Embed the review panel in the conversation inbox. Review annotations do not send messages to customers.
- [x] Synchronize the frontend OpenAPI copies from the Ford Service contract.
- [x] Verify lint, full frontend tests, production build, API contract check, and whitespace checks.
- [ ] Merge through the protected Ford-web release path and verify the deployed CRM inbox against the production Service API.

Implementation is committed on `feat/mia-phase-one-web` at `453a8a2`. Local verification passed: lint; 33 test files / 135 tests; production build (with the existing chunk-size warning); OpenAPI contract check (49 paths); `git diff --check`. No release has been published and production behavior remains unverified.

## Remaining Phase 1 dependencies

- [ ] Validate the shadow-review flow with authorized operator accounts and real tenant data in a non-production environment.
- [ ] Confirm the local CRM deployment's auth, tenant isolation, and CSRF behavior against the deployed Service contract.
- [ ] Release via protected workflow and verify the inbox flow in production after approval.

### Shadow-draft BFF route integration (2026-10-18)

- [x] Add BFF integration tests proving authenticated list and review routes reach Ford Service, unauthenticated requests are rejected, and review POST requires valid CSRF.
- [x] Add only the two shadow-draft route patterns to the BFF allowlist; preserve the existing session, CSRF, Service OAuth token, and method restrictions.
- [x] Verify the Ford-web BFF test suite, lint, and diff checks.

Results (2026-10-18): Full `bun run test` passes (33 files, 135 tests), `bun run lint` passes, `bun run api:check -- ../ford-service-emme-pages-cutover/ford-ai-service/docs/openapi/frontend-api.yaml` confirms all 49 paths, and `git diff --check` passes. `bun run build` also passed; only the existing large-chunk warning was reported. The shadow-draft panel test now exercises the real API client with a controlled fetch stub, avoiding the cross-file mock cache issue caused by `isolate: false`.

Acceptance: both UI endpoints pass through the same authenticated BFF session as other CRM APIs; unsafe POST is denied without CSRF and forwarded with it. No new arbitrary proxy paths or message-send route is introduced.

### Publication recheck (2026-10-18)

- [ ] Publish commits `453a8a2` and `6fd7de2`, plus the current BFF route/test changes, through Ford-web's protected release path. The branch is two commits ahead of `origin/main` with local changes; local `gh auth status` reports an invalid token and `api.github.com` DNS lookup fails. No push or production release occurred.

The 08:45 digest is implemented locally as the approved in-app-only inbox card. Production delivery verification remains open pending protected release and approved dealership calendar/operator dry-run.

### BDC digest implementation results (2026-10-18)

- Service endpoint: tenant-scoped authenticated GET, read-only bounded JDBC query, metadata-only response; OpenAPI synchronized. Full tests/build compile pass (808 tests); focused HTTP integration test passes.
- Ford-web: authenticated same-origin client and inbox card; 143/143 tests, TypeScript lint, build, 50-path API contract, and Pages function build pass.
- No release/deployment occurred.

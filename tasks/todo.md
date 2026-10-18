# MÍA Ford Uruapan Phase 1 — Ford-web

Ford-web is the locally hosted CRM application for the Ford Uruapan workflow. CRM functionality belongs in this app and its locally operated Ford Service backend; the plan does not call for integrating a separate external CRM provider.

## Shadow draft review in the inbox

- [x] Add a tenant-scoped client for listing unsent shadow drafts and annotating an advisor's accept/reject decision through Ford Service.
- [x] Embed the review panel in the conversation inbox. Review annotations do not send messages to customers.
- [x] Synchronize the frontend OpenAPI copies from the Ford Service contract.
- [x] Verify lint, full frontend tests, production build, API contract check, and whitespace checks.
- [ ] Merge through the protected Ford-web release path and verify the deployed CRM inbox against the production Service API.

Implementation is committed on `feat/mia-phase-one-web` at `453a8a2`. Local verification passed: lint; 33 test files / 134 tests; production build (with the existing chunk-size warning); OpenAPI contract check (49 paths); `git diff --check`. No release has been published and production behavior remains unverified.

## Remaining Phase 1 dependencies

- [ ] Validate the shadow-review flow with authorized operator accounts and real tenant data in a non-production environment.
- [ ] Confirm the local CRM deployment's auth, tenant isolation, and CSRF behavior against the deployed Service contract.
- [ ] Release via protected workflow and verify the inbox flow in production after approval.

The 8:45 digest is a separate open item in the Service plan. Ford-web does not currently implement or deliver it; its channel and behavior need to be defined within the local CRM workflow before implementation.

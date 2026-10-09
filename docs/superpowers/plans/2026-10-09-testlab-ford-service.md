# Ford Test Lab to Ford-service implementation

## Current state

Ford-service exposes a stateless Spring Security OAuth2 Resource Server. It validates bearer JWTs from the configured external issuer; it does not issue tokens or provide a login endpoint. Ford-web's previous login is a local demo flow whose mock JWT is not valid for Ford-service.

The Test Lab calls Ford-web's `/api/testlab/respond` BFF endpoint. The BFF forwards an incoming `Authorization: Bearer ...` header to Ford-service and returns an authentication error if no bearer token is supplied. It does not mint or substitute tokens. The existing Ford-web demo login remains available for the rest of the UI.

## Completed backend work

- Ford-service AI endpoint loads and saves Test Lab turns in PostgreSQL, scoped by validated JWT tenant and subject.
- Stored prompt context is bounded; successful assistant turns return a stable conversation ID, and cross-owner session reuse is rejected.
- Ford-service unit tests and the focused PostgreSQL persistence/owner-isolation integration test passed during implementation.

## Test Lab behavior and limitation

- Custom Test Lab prompts retain a stable session ID through refresh; presets use isolated IDs.
- Provider/auth errors are displayed as failures. Test Lab does not use Gemini or local evaluator fallback.
- A live Test Lab request requires a valid access token from the external issuer. The current demo login cannot provide one, and Ford-service has no token-issuing flow to reuse. Do not claim end-to-end authenticated UI connectivity until the actual issuer/token injection path is supplied.

## Verification history

- Ford-service full unit suite and focused persistence integration test passed during implementation.
- Earlier Ford-web lint, unit, and build checks passed before reverting the OIDC client. Re-run them after any further code changes.

# HAR Fixtures

Place recorded traffic here: `whatsapp-hot-lead.har`, `gemini-qualification.har`.

## Recording a new fixture

```bash
bunx playwright test --update-har  # or npx playwright test --update-har
```

Or manually, open the app with tracing on:

```bash
bunx playwright open --save-har=tests/e2e/fixtures/whatsapp-hot-lead.har --save-har-glob="**/api/**" http://localhost:3000
```

## Before committing a .har file

- [ ] Scrub access tokens, phone numbers, and any real customer names/PII
- [ ] Check for API keys in request headers (Authorization, X-Api-Key)
- [ ] Normalize or strip volatile query params (timestamps, request IDs)
- [ ] Re-run the relevant spec locally against the scrubbed file to confirm replay still matches before pushing

# Testing Architecture

Vitest and Playwright are the test frameworks, run with Bun or Node.js.

```
tests/
├── unit/            # Vitest — store, RBAC authority logic, pure functions (jsdom)
├── component/       # Vitest + RTL — className/aria assertions, MSW-backed
├── visual/          # Playwright — real-browser screenshots + axe contrast checks
└── e2e/
    ├── fixtures/*.har
    ├── takeover-flow.spec.ts
    ├── rbac-security.spec.ts
    └── meta-24h-window.spec.ts
```

## Commands

| Command | What it runs |
|---|---|
| `npm test` or `bun test` | Vitest unit + component suites |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:e2e` | Playwright E2E specs |
| `npm run test:visual` | Playwright visual regression + axe contrast |

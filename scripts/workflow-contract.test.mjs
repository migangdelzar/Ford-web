import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function smokeCurlCommands(source, marker) {
  const smoke = source.slice(source.indexOf(marker));
  const commands = [];
  for (const match of smoke.matchAll(/curl[^\n]*(?:\\\n[^\n]*)*/g)) {
    commands.push(match[0]);
  }
  return commands;
}

test('Pages preview UI and API smoke checks retry edge propagation responses', () => {
  const source = readFileSync('.github/workflows/preview.yml', 'utf8');
  const commands = smokeCurlCommands(source, 'Smoke the deployed preview');

  assert.equal(commands.length, 2, 'preview should smoke the UI and API');
  for (const command of commands) {
    assert.match(command, /--retry-all-errors/, 'preview curl should retry transient HTTP failures');
  }
});

test('production release runs the thorough Spring-proxy smoke checker', () => {
  const source = readFileSync('.github/workflows/release.yml', 'utf8');

  assert.match(source, /FORD_WEB_SMOKE_URL: \$\{\{ needs\.production-readiness\.outputs\.smoke_url \}\}/);
  assert.match(source, /FORD_WEB_UI_UPSTREAM_URL: https:\/\/emme-crm-ui\.pages\.dev/);
  assert.match(source, /run: bun run smoke:production/);
  assert.match(readFileSync('package.json', 'utf8'), /"smoke:production": "node scripts\/production-smoke\.mjs"/);
  assert.match(readFileSync('.github/workflows/ci.yml', 'utf8'), /node --test scripts\/workflow-contract\.test\.mjs scripts\/production-smoke\.test\.mjs/);
});

test('production Pages releases require an annotated SemVer tag and exact successful CI source', () => {
  const source = readFileSync('.github/workflows/release.yml', 'utf8');

  assert.doesNotMatch(source, /^  push:/m);
  assert.match(source, /version:/);
  assert.match(source, /INPUT_VERSION/);
  assert.match(source, /refs\/tags\/\$\{version\}/);
  assert.match(source, /git cat-file -t/);
  assert.match(source, /git merge-base --is-ancestor/);
  assert.match(source, /head_branch == \$version/);
  assert.match(source, /PRODUCTION_DEPLOY_ENABLED: \$\{\{ vars\.PRODUCTION_DEPLOY_ENABLED \}\}/);
  assert.match(source, /name: ford-release-result/);
  assert.match(source, /"deploymentId": os\.environ\["DEPLOYMENT_ID"\]/);
  assert.match(source, /"imageDigest": None/);
});

test('requested Pages releases fail instead of producing a skipped deployment artifact', () => {
  const source = readFileSync('.github/workflows/release.yml', 'utf8');

  assert.match(source, /Run Ford Web releases from main/);
  assert.match(source, /^  production-readiness:\s*$/m);
  assert.match(source, /PRODUCTION_DEPLOY_ENABLED: \$\{\{ vars\.PRODUCTION_DEPLOY_ENABLED \}\}/);
  assert.match(source, /production-readiness:[\s\S]*?environment: production/);
  assert.match(source, /deploy:[\s\S]*?environment: pages-preview/);
  assert.match(source, /SMOKE_URL: \$\{\{ vars\.FORD_WEB_SMOKE_URL \}\}/);
  assert.match(source, /needs\.production-readiness\.result == 'success'/);
  assert.doesNotMatch(source, /if:.*vars\.PRODUCTION_DEPLOY_ENABLED/);
  assert.doesNotMatch(source, /needs\.deploy\.result == 'skipped'/);
});

test('production Pages deployment uses the Pages credential environment after production approval', () => {
  const source = readFileSync('.github/workflows/release.yml', 'utf8');

  assert.match(source, /CLOUDFLARE_API_TOKEN: \$\{\{ secrets\.CLOUDFLARE_API_TOKEN \}\}/);
  assert.match(source, /CLOUDFLARE_ACCOUNT_ID: \$\{\{ vars\.CLOUDFLARE_ACCOUNT_ID \}\}/);
  assert.match(source, /Production Pages release blocked: add CLOUDFLARE_API_TOKEN to the pages-preview environment secrets/);
  assert.match(source, /SMOKE_URL: \$\{\{ needs\.production-readiness\.outputs\.smoke_url \}\}/);
  assert.match(source, /user\/tokens\/verify/);
  assert.match(source, /pages\/projects\/emme-crm-ui/);
});

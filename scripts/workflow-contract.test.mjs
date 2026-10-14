import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const workflows = [
  ['preview', '.github/workflows/preview.yml', 'Smoke the deployed preview'],
  ['production', '.github/workflows/release.yml', 'Smoke check public deployment'],
];

function smokeCurlCommands(source, marker) {
  const smoke = source.slice(source.indexOf(marker));
  const commands = [];
  for (const match of smoke.matchAll(/curl[^\n]*(?:\\\n[^\n]*)*/g)) {
    commands.push(match[0]);
  }
  return commands;
}

test('Pages UI and API smoke checks retry edge propagation responses', () => {
  for (const [environment, path, marker] of workflows) {
    const source = readFileSync(path, 'utf8');
    const commands = smokeCurlCommands(source, marker);

    assert.equal(commands.length, 2, `${environment} should smoke the UI and API`);
    for (const command of commands) {
      assert.match(command, /--retry-all-errors/, `${environment} curl should retry transient HTTP failures`);
    }
  }
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
  assert.match(source, /vars\.PRODUCTION_DEPLOY_ENABLED == 'true'/);
  assert.match(source, /name: ford-release-result/);
  assert.match(source, /"deploymentId": os\.environ\["DEPLOYMENT_ID"\]/);
  assert.match(source, /"imageDigest": None/);
});

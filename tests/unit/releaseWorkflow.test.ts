import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe, expect, it} from 'vitest';
import {parse} from 'yaml';

const workflowsPath = resolve(process.cwd(), '.github/workflows');

describe('Ford-web release workflow contract', () => {
  it('runs verification on branch pushes so release changes can be checked before merge', () => {
    const workflow = parse(
      readFileSync(resolve(workflowsPath, 'ci.yml'), 'utf8'),
    ) as {on: Record<string, unknown>};

    expect(workflow.on.push).toBeNull();
  });

  it('verifies PR changes without production credentials', () => {
    const workflow = parse(
      readFileSync(resolve(workflowsPath, 'ci.yml'), 'utf8'),
    ) as {on: Record<string, unknown>; jobs: Record<string, {steps: Array<{run?: string}>}>};
    const commands = workflow.jobs.verify.steps
      .map(step => step.run ?? '')
      .join('\n');

    expect(workflow.on).toHaveProperty('pull_request');
    expect(commands).toContain('bun install --frozen-lockfile');
    expect(commands).toContain('bun run lint');
    expect(commands).toContain('bun run test');
    expect(commands).toContain('bun run build');
    expect(commands).toContain('bun run api:check -- openapi.ford-service.yaml');
    expect(commands).toContain('bun run pages:check');
    expect(commands).not.toMatch(/wrangler pages deploy/);
  });

  it('gates deploy and rollback behind production approval and an explicit enable flag', () => {
    const workflow = parse(
      readFileSync(resolve(workflowsPath, 'release.yml'), 'utf8'),
    ) as {jobs: Record<string, {environment?: string; if?: string; outputs?: Record<string, string>; steps: Array<{run?: string}>}>};
    const deploy = workflow.jobs.deploy;
    const readiness = workflow.jobs['production-readiness'];
    const commands = deploy.steps.map(step => step.run ?? '').join('\n');

    expect(readiness.environment).toBe('production');
    expect(readiness.outputs?.smoke_url).toContain('steps.readiness.outputs.smoke_url');
    expect(deploy.environment).toBe('pages-preview');
    expect(deploy.if).toContain("github.ref == 'refs/heads/main'");
    expect(readiness.steps.map(step => step.run ?? '').join('\n')).toContain('PRODUCTION_DEPLOY_ENABLED');
    expect(commands).toContain('wrangler pages deploy');
    expect(commands).toContain('/client/v4/accounts/');
    expect(commands).toContain('.latest_stage.status == "success"');
    expect(commands).toContain('no successful prior production Pages deployment');
    expect(commands).toContain('Deployment ID: $deployment_id');
    expect(commands).toContain('bun run api:check -- openapi.ford-service.yaml');
    expect(commands).toContain('/api/v1/health');
  });

  it('reads the Cloudflare account ID from environment configuration and keeps the token secret', () => {
    const workflow = readFileSync(
      resolve(workflowsPath, 'release.yml'),
      'utf8',
    );

    expect(workflow).toContain('CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}');
    expect(workflow).toContain('CLOUDFLARE_ACCOUNT_ID: ${{ vars.CLOUDFLARE_ACCOUNT_ID }}');
    expect(workflow).not.toContain('CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}');
  });

  it('limits the GitHub Actions Pages smoke deploy to a non-production preview', () => {
    const workflow = parse(
      readFileSync(resolve(workflowsPath, 'preview.yml'), 'utf8'),
    ) as {
      on: {push: {branches: string[]}};
      jobs: Record<string, {environment?: string; steps: Array<{run?: string}>}>;
    };
    const preview = workflow.jobs.preview;
    const commands = preview.steps.map(step => step.run ?? '').join('\n');

    expect(workflow.on.push.branches).toContain('chore/platform-secret-management');
    expect(preview.environment).toBe('pages-preview');
    expect(commands).toContain('--branch actions-e2e-preview');
    expect(commands).not.toContain('--branch main');
    expect(commands).toContain('/client/v4/accounts/');
    expect(commands).toContain('.latest_stage.status == "success"');
    expect(commands).toContain('/api/v1/health');
  });

  it('allows verified main to run a retried Pages preview without enabling production', () => {
    const workflow = parse(
      readFileSync(resolve(workflowsPath, 'preview.yml'), 'utf8'),
    ) as {
      on: {workflow_dispatch?: unknown};
      jobs: Record<string, {if?: string; steps: Array<{run?: string}>}>;
    };
    const preview = workflow.jobs.preview;
    const commands = preview.steps.map(step => step.run ?? '').join('\n');

    expect(workflow.on).toHaveProperty('workflow_dispatch');
    expect(preview.if).toContain("github.ref == 'refs/heads/main'");
    expect(preview.if).toContain("github.ref == 'refs/heads/chore/platform-secret-management'");
    expect(commands).toContain('--branch actions-e2e-preview');
    expect(commands).toContain('--retry-all-errors');
    expect(commands).not.toContain('--branch main');
  });

  it('uses the replacement Cloudflare Pages project consistently across workflows', () => {
    const config = JSON.parse(
      readFileSync(resolve(process.cwd(), 'wrangler.jsonc'), 'utf8'),
    ) as {name: string};
    const preview = readFileSync(resolve(workflowsPath, 'preview.yml'), 'utf8');
    const release = readFileSync(resolve(workflowsPath, 'release.yml'), 'utf8');

    expect(config.name).toBe('emme-crm-ui');
    expect(preview).toContain('--project-name emme-crm-ui');
    expect(preview).toContain('--branch actions-e2e-preview');
    expect(release).toContain('--project-name emme-crm-ui');
    expect(preview).toContain('.deployment_trigger.metadata.commit_hash == $sha');
    expect(release).toContain('.deployment_trigger.metadata.commit_hash == $sha');
    expect(release).toContain('.latest_stage.status == "success"');
  });

  it('stages the new Pages origin only from verified main in the preview environment', () => {
    const workflow = parse(
      readFileSync(resolve(workflowsPath, 'pages-origin-cutover.yml'), 'utf8'),
    ) as {
      on: {workflow_dispatch?: unknown};
      jobs: Record<string, {environment?: string; if?: string; steps: Array<{run?: string; env?: Record<string, string>}>}>;
    };
    const deploy = workflow.jobs.deploy;
    const commands = deploy.steps.map(step => step.run ?? '').join('\n');

    expect(workflow.on).toHaveProperty('workflow_dispatch');
    expect(deploy.environment).toBe('pages-preview');
    expect(deploy.if).toContain("github.ref == 'refs/heads/main'");
    expect(commands).toContain('gh run list --workflow ci.yml --branch main');
    expect(commands).toContain('--project-name emme-crm-ui');
    expect(commands).toContain('--branch main');
    expect(deploy.steps.some(step => step.env?.ORIGIN === 'https://emme-crm-ui.pages.dev')).toBe(true);
    expect(commands).toContain('/login');
    expect(commands).toContain('asset_path');
    expect(commands).toContain('fingerprinted asset');
    expect(commands).toContain('ford-crm-ui.pages.dev');
    expect(commands).toContain('retained for rollback');
  });

  it('uses Ford-service as the backend and does not publish a standalone BFF image', () => {
    const ci = readFileSync(resolve(workflowsPath, 'ci.yml'), 'utf8');
    const release = readFileSync(resolve(workflowsPath, 'release.yml'), 'utf8');
    const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>;
    };

    expect(ci).not.toContain('Dockerfile.bff');
    expect(release).not.toContain('publish-bff');
    expect(release).not.toContain('docker/build-push-action');
    expect(release).toContain('wrangler pages deploy');
    expect(packageJson.scripts.build).not.toContain('build:bff');
    expect(packageJson.scripts['build:bff']).toBeUndefined();
    expect(() => readFileSync(resolve(process.cwd(), 'Dockerfile.bff'))).toThrow();
  });
});

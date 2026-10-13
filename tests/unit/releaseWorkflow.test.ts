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
    ) as {jobs: Record<string, {environment?: string; if?: string; steps: Array<{run?: string}>}>};
    const deploy = workflow.jobs.deploy;
    const commands = deploy.steps.map(step => step.run ?? '').join('\n');

    expect(deploy.environment).toBe('production');
    expect(deploy.if).toContain("github.ref == 'refs/heads/main'");
    expect(deploy.if).toContain("vars.PRODUCTION_DEPLOY_ENABLED == 'true'");
    expect(commands).toContain('wrangler pages deploy');
    expect(commands).toContain('/client/v4/accounts/');
    expect(commands).toContain('.latest_stage.status == "success"');
    expect(commands).toContain('no successful prior production Pages deployment');
    expect(commands).toContain('Deployment ID: $deployment_id');
    expect(commands).toContain('bun run api:check -- openapi.ford-service.yaml');
    expect(commands).toContain('/api/v1/health');
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

  it('uses the existing Cloudflare Pages project consistently across workflows', () => {
    const config = JSON.parse(
      readFileSync(resolve(process.cwd(), 'wrangler.jsonc'), 'utf8'),
    ) as {name: string};
    const preview = readFileSync(resolve(workflowsPath, 'preview.yml'), 'utf8');
    const release = readFileSync(resolve(workflowsPath, 'release.yml'), 'utf8');

    expect(config.name).toBe('ford-web-ui');
    expect(preview).toContain('--project-name ford-web-ui');
    expect(release).toContain('--project-name ford-web-ui');
    expect(preview).toContain('.deployment_trigger.metadata.commit_hash == $sha');
    expect(release).toContain('.deployment_trigger.metadata.commit_hash == $sha');
    expect(release).toContain('.latest_stage.status == "success"');
  });
});

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { composeOpenApi } from '../../scripts/api-contract';

const serviceSpecPath = resolve(
  import.meta.dirname,
  '../../../Ford-uruapan/ford-ai-service/docs/openapi/frontend-api.yaml',
);

function readYaml(path: string): Record<string, any> {
  return parse(readFileSync(path, 'utf8')) as Record<string, any>;
}

describe('published API contract', () => {
  const service = readYaml(serviceSpecPath);
  const bff = readYaml(resolve(import.meta.dirname, '../../openapi.bff.yaml'));
  const expected = composeOpenApi(service, bff);
  const webRoot = readYaml(resolve(import.meta.dirname, '../../openapi.yaml'));
  const webShared = readYaml(resolve(import.meta.dirname, '../../src/shared/api/openapi.yaml'));
  const webJson = JSON.parse(
    readFileSync(resolve(import.meta.dirname, '../../src/shared/api/openapi.json'), 'utf8'),
  ) as Record<string, any>;

  it('keeps every backend operation and AI schema in both web YAML copies', () => {
    for (const [path, operations] of Object.entries(service.paths)) {
      expect(webRoot.paths[path], `root OpenAPI missing ${path}`).toEqual(operations);
      expect(webShared.paths[path], `shared OpenAPI missing ${path}`).toEqual(operations);
    }

    for (const schemaName of ['AiRespondRequest', 'AiRespondResponse']) {
      expect(webRoot.components.schemas[schemaName]).toEqual(service.components.schemas[schemaName]);
      expect(webShared.components.schemas[schemaName]).toEqual(service.components.schemas[schemaName]);
    }
  });

  it('keeps root YAML, shared YAML, and served JSON synchronized', () => {
    expect(webRoot).toEqual(expected);
    expect(webShared).toEqual(expected);
    expect(webJson).toEqual(expected);
  });

  it('documents Spring session auth and uses the canonical AI endpoint for Test Lab', () => {
    expect(webRoot.paths['/api/auth/csrf']?.get).toBeDefined();
    expect(webRoot.paths['/api/auth/one-time-token']?.post).toBeDefined();
    expect(webRoot.paths['/api/auth/me']?.get?.security).toEqual([{ operatorSessionCookie: [] }]);
    expect(webRoot.paths['/api/auth/logout']?.post?.security).toEqual([{ operatorSessionCookie: [] }]);
    expect(webRoot.components.securitySchemes.operatorSessionCookie.name).toBe('SESSION');
    expect(webRoot.paths['/api/v1/ai/respond']?.post).toBeDefined();
    expect(webRoot.paths['/api/testlab/respond']).toBeUndefined();
  });
});

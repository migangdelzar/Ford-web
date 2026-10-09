import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { contractMatches, loadComposedContract, parseOpenApi } from './api-contract';

const servicePath = process.argv[2];
if (!servicePath) {
  console.error('Usage: bun run api:check -- <Ford-service frontend-api.yaml path>');
  process.exit(2);
}

const root = process.cwd();
const expected = loadComposedContract(resolve(root, servicePath), resolve(root, 'openapi.bff.yaml'));
const actualDocuments = [
  parseOpenApi(readFileSync(resolve(root, 'openapi.yaml'), 'utf8'), 'openapi.yaml'),
  parseOpenApi(readFileSync(resolve(root, 'src/shared/api/openapi.yaml'), 'utf8'), 'shared OpenAPI YAML'),
  JSON.parse(readFileSync(resolve(root, 'src/shared/api/openapi.json'), 'utf8')),
];
const labels = ['openapi.yaml', 'src/shared/api/openapi.yaml', 'src/shared/api/openapi.json'];
const mismatches = actualDocuments.flatMap((document, index) =>
  contractMatches(document, expected) ? [] : [labels[index]],
);

if (mismatches.length > 0) {
  console.error(`OpenAPI drift detected: ${mismatches.join(', ')}`);
  process.exit(1);
}

console.log(`OpenAPI contracts match: ${Object.keys(expected.paths).length} paths.`);

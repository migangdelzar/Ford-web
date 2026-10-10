import { resolve } from 'node:path';
import { loadComposedContract, writeWebContracts } from './api-contract';

const servicePath = process.argv[2];
if (!servicePath) {
  console.error('Usage: bun run api:sync -- <Ford-service frontend-api.yaml path>');
  process.exit(2);
}

const root = process.cwd();
const contract = loadComposedContract(
  resolve(root, servicePath),
  resolve(root, 'openapi.bff.yaml'),
);
writeWebContracts(contract, root);
console.log(`Synced ${Object.keys(contract.paths).length} API paths from Ford-service and transitional Ford-web routes.`);

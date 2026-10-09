import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { parse, stringify } from 'yaml';

export type OpenApiDocument = Record<string, any>;

export function parseOpenApi(source: string, label: string): OpenApiDocument {
  const document = parse(source) as OpenApiDocument | null;
  if (!document || typeof document !== 'object' || !document.paths || !document.components) {
    throw new Error(`${label} is not a valid OpenAPI document`);
  }
  return document;
}

export function composeOpenApi(service: OpenApiDocument, bff: OpenApiDocument): OpenApiDocument {
  const paths = { ...service.paths };
  for (const [path, pathItem] of Object.entries(bff.paths)) {
    if (path in paths) throw new Error(`BFF path conflicts with Ford-service contract: ${path}`);
    paths[path] = pathItem;
  }

  const components = { ...service.components };
  for (const [section, entries] of Object.entries(bff.components)) {
    const baseEntries = components[section] ?? {};
    for (const [name, value] of Object.entries(entries as Record<string, unknown>)) {
      if (name in baseEntries && !isDeepStrictEqual(baseEntries[name], value)) {
        throw new Error(`BFF component conflicts with Ford-service component: ${section}.${name}`);
      }
    }
    components[section] = { ...baseEntries, ...(entries as Record<string, unknown>) };
  }

  const tagsByName = new Map<string, Record<string, unknown>>();
  for (const tag of [...(service.tags ?? []), ...(bff.tags ?? [])]) tagsByName.set(tag.name, tag);

  return {
    ...service,
    paths,
    components,
    tags: [...tagsByName.values()],
  };
}

export function loadComposedContract(servicePath: string, bffPath: string): OpenApiDocument {
  const service = parseOpenApi(readFileSync(servicePath, 'utf8'), servicePath);
  const bff = parseOpenApi(readFileSync(bffPath, 'utf8'), bffPath);
  return composeOpenApi(service, bff);
}

export function writeWebContracts(document: OpenApiDocument, root = process.cwd()): void {
  const yaml = stringify(document, { lineWidth: 0 });
  writeFileSync(resolve(root, 'openapi.yaml'), yaml);
  writeFileSync(resolve(root, 'src/shared/api/openapi.yaml'), yaml);
  writeFileSync(resolve(root, 'src/shared/api/openapi.json'), `${JSON.stringify(document, null, 2)}\n`);
}

export function contractMatches(actual: OpenApiDocument, expected: OpenApiDocument): boolean {
  return isDeepStrictEqual(actual, expected);
}

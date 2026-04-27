// Lightweight OpenAPI / Swagger 2 viewer + structural validator.
// We don't bundle a full schema validator (too heavy); instead we check
// the document shape against the parts of the spec people care about.

import { parse as parseYaml } from 'yaml';

export type SpecVersion = 'swagger-2' | 'openapi-3' | 'unknown';

export interface ParsedSpec {
  version: SpecVersion
  title?: string
  versionString?: string
  description?: string
  servers: string[]
  endpoints: Endpoint[]
  schemas: SchemaSummary[]
  raw: any
}

export interface Endpoint {
  method: string
  path: string
  summary?: string
  description?: string
  operationId?: string
  tags: string[]
  parameters: ParamSummary[]
  responses: { code: string; description?: string }[]
}

export interface ParamSummary {
  name: string
  in: string // path | query | header | cookie | body | formData
  required: boolean
  type?: string
  description?: string
}

export interface SchemaSummary {
  name: string
  type?: string
  required: string[]
  properties: { name: string; type?: string; description?: string }[]
}

export interface ValidationIssue {
  level: 'error' | 'warning'
  path: string
  message: string
}

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head', 'trace'];

export function parseSpec(text: string): ParsedSpec {
  if (!text.trim()) {
    return { version: 'unknown', servers: [], endpoints: [], schemas: [], raw: null };
  }
  let raw: any;
  try {
    raw = JSON.parse(text);
  }
  catch {
    raw = parseYaml(text);
  }
  const version: SpecVersion
    = raw?.openapi
      ? 'openapi-3'
      : raw?.swagger === '2.0'
        ? 'swagger-2'
        : 'unknown';

  const info = raw?.info ?? {};
  const servers = collectServers(raw, version);
  const endpoints = collectEndpoints(raw);
  const schemas = collectSchemas(raw, version);

  return {
    version,
    title: info.title,
    versionString: info.version,
    description: info.description,
    servers,
    endpoints,
    schemas,
    raw,
  };
}

function collectServers(raw: any, version: SpecVersion): string[] {
  if (version === 'openapi-3' && Array.isArray(raw.servers)) {
    return raw.servers.map((s: any) => s.url).filter(Boolean);
  }
  if (version === 'swagger-2') {
    const scheme = (raw.schemes && raw.schemes[0]) || 'https';
    if (raw.host) {
      return [`${scheme}://${raw.host}${raw.basePath || ''}`];
    }
  }
  return [];
}

function collectEndpoints(raw: any): Endpoint[] {
  const out: Endpoint[] = [];
  const paths = raw?.paths ?? {};
  for (const [p, item] of Object.entries(paths)) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const itemObj = item as Record<string, any>;
    const itemParams: any[] = Array.isArray(itemObj.parameters) ? itemObj.parameters : [];
    for (const m of HTTP_METHODS) {
      const op = itemObj[m];
      if (!op) {
        continue;
      }
      const params = [...itemParams, ...((Array.isArray(op.parameters) ? op.parameters : []))];
      out.push({
        method: m.toUpperCase(),
        path: p,
        summary: op.summary,
        description: op.description,
        operationId: op.operationId,
        tags: op.tags ?? [],
        parameters: params.map((pp: any) => ({
          name: pp.name,
          in: pp.in,
          required: !!pp.required,
          type: pp.schema?.type ?? pp.type,
          description: pp.description,
        })),
        responses: Object.entries(op.responses ?? {}).map(([code, r]) => ({ code, description: (r as any)?.description })),
      });
    }
  }
  return out;
}

function collectSchemas(raw: any, version: SpecVersion): SchemaSummary[] {
  const dict = version === 'openapi-3'
    ? (raw?.components?.schemas ?? {})
    : (raw?.definitions ?? {});
  const out: SchemaSummary[] = [];
  for (const [name, sch] of Object.entries(dict)) {
    if (!sch || typeof sch !== 'object') {
      continue;
    }
    const s = sch as any;
    const props = s.properties ?? {};
    out.push({
      name,
      type: s.type,
      required: Array.isArray(s.required) ? s.required : [],
      properties: Object.entries(props).map(([pn, pp]: any) => ({
        name: pn,
        type: pp?.type ?? (pp?.$ref ? `$ref ${pp.$ref}` : undefined),
        description: pp?.description,
      })),
    });
  }
  return out;
}

export function validate(parsed: ParsedSpec): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!parsed.raw) {
    return [{ level: 'error', path: '/', message: 'No content to validate.' }];
  }
  if (parsed.version === 'unknown') {
    issues.push({ level: 'error', path: '/', message: 'Missing top-level "openapi" (3.x) or "swagger: 2.0".' });
  }
  if (!parsed.raw.info) {
    issues.push({ level: 'error', path: '/info', message: 'info object is required.' });
  }
  else {
    if (!parsed.raw.info.title) {
      issues.push({ level: 'error', path: '/info/title', message: 'info.title is required.' });
    }
    if (!parsed.raw.info.version) {
      issues.push({ level: 'error', path: '/info/version', message: 'info.version is required.' });
    }
  }
  if (!parsed.raw.paths || Object.keys(parsed.raw.paths).length === 0) {
    issues.push({ level: 'warning', path: '/paths', message: 'No paths declared.' });
  }
  if (parsed.version === 'openapi-3' && (!Array.isArray(parsed.raw.servers) || parsed.raw.servers.length === 0)) {
    issues.push({ level: 'warning', path: '/servers', message: 'No servers declared. Tools will assume the spec URL host.' });
  }

  // Per-operation checks
  for (const e of parsed.endpoints) {
    if (!e.responses.length) {
      issues.push({ level: 'warning', path: `${e.path} ${e.method}`, message: 'Operation has no responses.' });
    }
    if (!e.summary && !e.description) {
      issues.push({ level: 'warning', path: `${e.path} ${e.method}`, message: 'Operation has neither summary nor description.' });
    }
    if (!e.operationId) {
      issues.push({ level: 'warning', path: `${e.path} ${e.method}`, message: 'Missing operationId (recommended for codegen).' });
    }
  }

  return issues;
}

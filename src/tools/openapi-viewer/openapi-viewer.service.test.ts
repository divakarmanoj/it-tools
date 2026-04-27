import { describe, expect, it } from 'vitest';
import { parseSpec, validate } from './openapi-viewer.service';

const OAS3 = `openapi: 3.0.3
info:
  title: Petstore
  version: 1.0.0
servers:
  - url: https://api.test/v1
paths:
  /pets:
    get:
      operationId: listPets
      summary: List pets
      tags: [pets]
      parameters:
        - name: limit
          in: query
          schema: { type: integer }
      responses:
        '200': { description: ok }
components:
  schemas:
    Pet:
      type: object
      required: [id]
      properties:
        id: { type: string }
        name: { type: string }
`;

const SWAG2 = `swagger: "2.0"
info:
  title: Old
  version: 1.0
host: api.test
basePath: /v1
schemes: [https]
paths:
  /things:
    get:
      operationId: listThings
      summary: List things
      responses:
        '200': { description: ok }
definitions:
  Thing:
    type: object
    required: [id]
    properties:
      id: { type: string }
`;

describe('parseSpec — OpenAPI 3', () => {
  it('detects version and title', () => {
    const p = parseSpec(OAS3);
    expect(p.version).toBe('openapi-3');
    expect(p.title).toBe('Petstore');
    expect(p.versionString).toBe('1.0.0');
    expect(p.servers).toEqual(['https://api.test/v1']);
  });

  it('extracts endpoints with parameters and responses', () => {
    const p = parseSpec(OAS3);
    expect(p.endpoints).toHaveLength(1);
    const e = p.endpoints[0];
    expect(e.method).toBe('GET');
    expect(e.path).toBe('/pets');
    expect(e.operationId).toBe('listPets');
    expect(e.tags).toContain('pets');
    expect(e.parameters[0]).toMatchObject({ name: 'limit', in: 'query', type: 'integer', required: false });
    expect(e.responses[0]).toMatchObject({ code: '200' });
  });

  it('extracts schemas with required + properties', () => {
    const p = parseSpec(OAS3);
    expect(p.schemas).toHaveLength(1);
    expect(p.schemas[0]).toMatchObject({ name: 'Pet', required: ['id'] });
    expect(p.schemas[0].properties).toEqual(expect.arrayContaining([
      { name: 'id', type: 'string', description: undefined },
      { name: 'name', type: 'string', description: undefined },
    ]));
  });
});

describe('parseSpec — Swagger 2', () => {
  it('builds server URL from host/basePath/schemes', () => {
    const p = parseSpec(SWAG2);
    expect(p.version).toBe('swagger-2');
    expect(p.servers).toEqual(['https://api.test/v1']);
    expect(p.endpoints).toHaveLength(1);
    expect(p.schemas[0].name).toBe('Thing');
  });
});

describe('parseSpec — JSON input', () => {
  it('accepts JSON', () => {
    const json = JSON.stringify({ openapi: '3.0.0', info: { title: 'J', version: '1.0' }, paths: {} });
    const p = parseSpec(json);
    expect(p.version).toBe('openapi-3');
    expect(p.title).toBe('J');
  });
});

describe('validate', () => {
  it('flags missing version field', () => {
    const p = parseSpec('foo: bar');
    const issues = validate(p);
    expect(issues.some(i => i.level === 'error' && i.message.includes('openapi'))).toBe(true);
  });

  it('flags missing info.title and info.version', () => {
    const p = parseSpec('openapi: 3.0.0\ninfo: {}\npaths: {}');
    const issues = validate(p);
    expect(issues.some(i => i.path === '/info/title')).toBe(true);
    expect(issues.some(i => i.path === '/info/version')).toBe(true);
  });

  it('warns on no responses, missing summary, missing operationId', () => {
    const spec = `openapi: 3.0.0
info: { title: T, version: '1' }
paths:
  /x:
    get:
      responses: {}
`;
    const issues = validate(parseSpec(spec));
    const ops = issues.filter(i => i.path.includes('/x'));
    expect(ops.length).toBeGreaterThanOrEqual(2);
  });

  it('passes a clean spec', () => {
    const issues = validate(parseSpec(OAS3));
    expect(issues.filter(i => i.level === 'error')).toHaveLength(0);
  });
});

import { describe, expect, it } from 'vitest';
import { WELL_KNOWN_PORTS, searchPorts } from './well-known-ports.service';

describe('well-known-ports', () => {
  it('bundles a non-trivial port table', () => {
    expect(WELL_KNOWN_PORTS.length).toBeGreaterThan(80);
  });

  it('includes the headline well-known ports', () => {
    const ports = WELL_KNOWN_PORTS.map(p => p.port);
    expect(ports).toContain(22);
    expect(ports).toContain(80);
    expect(ports).toContain(443);
    expect(ports).toContain(5432);
    expect(ports).toContain(6379);
    expect(ports).toContain(27017);
  });

  it('returns full list for empty query', () => {
    expect(searchPorts('')).toHaveLength(WELL_KNOWN_PORTS.length);
    expect(searchPorts('   ')).toHaveLength(WELL_KNOWN_PORTS.length);
  });

  it('matches by exact port number', () => {
    const r = searchPorts('443');
    expect(r.some(p => p.port === 443)).toBe(true);
  });

  it('matches by service substring (case-insensitive)', () => {
    const r = searchPorts('POSTGRES');
    expect(r.some(p => p.service.toLowerCase().includes('postgres'))).toBe(true);
  });

  it('matches by description substring', () => {
    const r = searchPorts('redis');
    expect(r.length).toBeGreaterThanOrEqual(1);
    expect(r[0].port).toBe(6379);
  });
});

import { type PortEntry, WELL_KNOWN_PORTS } from './well-known-ports-data';

export { type PortEntry, WELL_KNOWN_PORTS } from './well-known-ports-data';

export function searchPorts(query: string): PortEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return WELL_KNOWN_PORTS;
  }
  const isNumber = /^\d+$/.test(q);
  return WELL_KNOWN_PORTS.filter((p) => {
    if (isNumber && String(p.port) === q) {
      return true;
    }
    if (isNumber && String(p.port).startsWith(q)) {
      return true;
    }
    return (
      p.service.toLowerCase().includes(q)
      || p.description.toLowerCase().includes(q)
      || p.protocol.toLowerCase().includes(q)
    );
  });
}

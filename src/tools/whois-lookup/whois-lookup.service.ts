export type WhoisQueryKind = 'domain' | 'ip';

export interface WhoisField {
  label: string
  value: string
}

export interface WhoisResult {
  kind: WhoisQueryKind
  query: string
  raw: any
  fields: WhoisField[]
}

function isIpAddress(s: string): boolean {
  if (/^[0-9.]+$/.test(s) && s.split('.').length === 4) {
    return s.split('.').every((o) => {
      const n = Number(o);
      return Number.isInteger(n) && n >= 0 && n <= 255;
    });
  }
  return /:/.test(s) && /^[0-9a-fA-F:]+$/.test(s);
}

function fmtDate(s: string | undefined | null): string {
  if (!s) {
    return '';
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toISOString();
}

function pickEvent(events: any[] | undefined, action: string): string {
  return fmtDate(events?.find((e: any) => e.eventAction === action)?.eventDate);
}

function summarizeDomain(j: any): WhoisField[] {
  const fields: WhoisField[] = [];
  if (j.ldhName || j.unicodeName) {
    fields.push({ label: 'Domain', value: j.ldhName || j.unicodeName });
  }
  if (j.handle) {
    fields.push({ label: 'Registry handle', value: j.handle });
  }
  if (j.status?.length) {
    fields.push({ label: 'Status', value: j.status.join(', ') });
  }
  const reg = pickEvent(j.events, 'registration');
  const exp = pickEvent(j.events, 'expiration');
  const upd = pickEvent(j.events, 'last changed');
  if (reg) {
    fields.push({ label: 'Registered', value: reg });
  }
  if (upd) {
    fields.push({ label: 'Last changed', value: upd });
  }
  if (exp) {
    fields.push({ label: 'Expires', value: exp });
  }
  if (j.nameservers?.length) {
    fields.push({ label: 'Nameservers', value: j.nameservers.map((n: any) => n.ldhName).join(', ') });
  }
  for (const ent of j.entities ?? []) {
    const role = (ent.roles ?? []).join('/');
    const vcard = ent.vcardArray?.[1] ?? [];
    const fn = vcard.find((row: any[]) => row[0] === 'fn')?.[3];
    if (fn && role) {
      fields.push({ label: role, value: fn });
    }
  }
  return fields;
}

function summarizeIp(j: any): WhoisField[] {
  const fields: WhoisField[] = [];
  if (j.handle) {
    fields.push({ label: 'Handle', value: j.handle });
  }
  if (j.startAddress && j.endAddress) {
    fields.push({ label: 'Range', value: `${j.startAddress} – ${j.endAddress}` });
  }
  if (j.cidr0_cidrs?.length) {
    fields.push({ label: 'CIDR', value: j.cidr0_cidrs.map((c: any) => `${c.v4prefix || c.v6prefix}/${c.length}`).join(', ') });
  }
  if (j.country) {
    fields.push({ label: 'Country', value: j.country });
  }
  if (j.name) {
    fields.push({ label: 'Name', value: j.name });
  }
  const reg = pickEvent(j.events, 'registration');
  const upd = pickEvent(j.events, 'last changed');
  if (reg) {
    fields.push({ label: 'Registered', value: reg });
  }
  if (upd) {
    fields.push({ label: 'Last changed', value: upd });
  }
  for (const ent of j.entities ?? []) {
    const role = (ent.roles ?? []).join('/');
    const vcard = ent.vcardArray?.[1] ?? [];
    const fn = vcard.find((row: any[]) => row[0] === 'fn')?.[3];
    if (fn && role) {
      fields.push({ label: role, value: fn });
    }
  }
  return fields;
}

export async function whoisLookup(query: string): Promise<WhoisResult> {
  const q = query.trim();
  if (!q) {
    throw new Error('Query is required.');
  }
  const kind: WhoisQueryKind = isIpAddress(q) ? 'ip' : 'domain';
  const url = `https://rdap.org/${kind}/${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { Accept: 'application/rdap+json' } });
  if (!res.ok) {
    throw new Error(`RDAP request failed: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  return {
    kind,
    query: q,
    raw: json,
    fields: kind === 'domain' ? summarizeDomain(json) : summarizeIp(json),
  };
}

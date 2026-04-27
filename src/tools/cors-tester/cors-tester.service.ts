// CORS preflight tester. Sends an OPTIONS request from the browser and inspects
// the response headers. Browser CORS itself constrains what we can read — we
// rely on `mode: 'cors'` and surface the raw `Access-Control-*` headers when
// the server returns them and they're exposed.

export interface CorsTestRequest {
  url: string
  method: string // GET, POST, PUT, ...
  origin?: string // browser fills this; informational only
  requestHeaders: string[] // extra headers planned for the actual request
}

export interface CorsHeaderRow {
  name: string
  value: string | null
  importance: 'critical' | 'helpful' | 'info'
  note?: string
}

export interface CorsTestResult {
  ok: boolean
  status: number
  statusText: string
  preflightSucceeded: boolean
  headerRows: CorsHeaderRow[]
  requestPreview: { method: string; url: string; headers: Record<string, string> }
  rawError?: string
  curl: string
  willMatchOrigin: boolean | null
  willAllowMethod: boolean | null
  willAllowHeaders: boolean | null
}

const ALWAYS_SHOWN: Array<{ key: string; importance: CorsHeaderRow['importance']; note?: string }> = [
  { key: 'access-control-allow-origin', importance: 'critical', note: 'Must echo the request Origin (or "*" for non-credentialed requests).' },
  { key: 'access-control-allow-methods', importance: 'critical', note: 'Lists allowed methods on this URL.' },
  { key: 'access-control-allow-headers', importance: 'critical', note: 'Lists allowed request headers.' },
  { key: 'access-control-allow-credentials', importance: 'helpful', note: 'Required if the client sends cookies/auth.' },
  { key: 'access-control-expose-headers', importance: 'helpful', note: 'Lets JS read these response headers.' },
  { key: 'access-control-max-age', importance: 'helpful', note: 'Cache preflight result for N seconds.' },
  { key: 'vary', importance: 'info', note: 'Should include "Origin" if the response varies on it.' },
];

function listIncludesAny(list: string | null, needle: string): boolean {
  if (!list) {
    return false;
  }
  return list.split(',').map(s => s.trim().toLowerCase()).includes(needle.toLowerCase());
}

function listIncludesAll(list: string | null, needles: string[]): boolean {
  if (!list) {
    return false;
  }
  const set = new Set(list.split(',').map(s => s.trim().toLowerCase()));
  if (set.has('*')) {
    return true;
  }
  return needles.every(n => set.has(n.toLowerCase()));
}

export function buildCurl(req: { url: string; method: string; origin?: string; requestHeaders: string[] }): string {
  const parts = [
    'curl -v -X OPTIONS',
    `'${req.url}'`,
    `-H 'Origin: ${req.origin || 'https://your-frontend.example'}'`,
    `-H 'Access-Control-Request-Method: ${req.method.toUpperCase()}'`,
  ];
  if (req.requestHeaders.length) {
    parts.push(`-H 'Access-Control-Request-Headers: ${req.requestHeaders.join(', ')}'`);
  }
  return parts.join(' \\\n  ');
}

// Exported for testing: classify what a server response means for the request.
export function classifyAllow(opts: {
  allowOrigin: string | null
  allowMethods: string | null
  allowHeaders: string | null
  origin: string
  method: string
  requestHeaders: string[]
}): { willMatchOrigin: boolean | null; willAllowMethod: boolean | null; willAllowHeaders: boolean | null } {
  const { allowOrigin, allowMethods, allowHeaders, origin, method, requestHeaders } = opts;
  const willMatchOrigin = allowOrigin === '*' || (origin ? allowOrigin === origin : null);
  const willAllowMethod = allowMethods ? (allowMethods.includes('*') || listIncludesAny(allowMethods, method)) : null;
  const willAllowHeaders = requestHeaders.length
    ? (allowHeaders ? listIncludesAll(allowHeaders, requestHeaders) : false)
    : true;
  return { willMatchOrigin, willAllowMethod, willAllowHeaders };
}

export async function runCorsPreflight(req: CorsTestRequest): Promise<CorsTestResult> {
  const headers = new Headers({
    'Access-Control-Request-Method': req.method.toUpperCase(),
  });
  if (req.requestHeaders.length) {
    headers.set('Access-Control-Request-Headers', req.requestHeaders.map(h => h.trim()).filter(Boolean).join(', '));
  }

  const curl = buildCurl(req);
  const requestPreview = {
    method: 'OPTIONS',
    url: req.url,
    headers: Object.fromEntries(headers.entries()),
  };

  let resp: Response;
  try {
    resp = await fetch(req.url, {
      method: 'OPTIONS',
      mode: 'cors',
      headers,
    });
  }
  catch (err: any) {
    return {
      ok: false,
      status: 0,
      statusText: '',
      preflightSucceeded: false,
      headerRows: [],
      requestPreview,
      rawError: err?.message ?? String(err),
      curl,
      willMatchOrigin: null,
      willAllowMethod: null,
      willAllowHeaders: null,
    };
  }

  const headerRows: CorsHeaderRow[] = ALWAYS_SHOWN.map(({ key, importance, note }) => ({
    name: key.replace(/(^|-)([a-z])/g, (_, dash, ch) => dash + ch.toUpperCase()),
    value: resp.headers.get(key),
    importance,
    note,
  }));

  const allowOrigin = resp.headers.get('access-control-allow-origin');
  const allowMethods = resp.headers.get('access-control-allow-methods');
  const allowHeaders = resp.headers.get('access-control-allow-headers');

  const originToCheck = req.origin || (typeof location !== 'undefined' ? location.origin : '');
  const { willMatchOrigin, willAllowMethod, willAllowHeaders } = classifyAllow({
    allowOrigin, allowMethods, allowHeaders, origin: originToCheck, method: req.method, requestHeaders: req.requestHeaders,
  });

  const preflightSucceeded
    = resp.ok
    && willMatchOrigin === true
    && willAllowMethod === true
    && willAllowHeaders === true;

  return {
    ok: resp.ok,
    status: resp.status,
    statusText: resp.statusText,
    preflightSucceeded,
    headerRows,
    requestPreview,
    curl,
    willMatchOrigin,
    willAllowMethod,
    willAllowHeaders,
  };
}

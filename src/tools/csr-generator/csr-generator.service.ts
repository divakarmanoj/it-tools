import { md, pki } from 'node-forge';
import workerScript from 'node-forge/dist/prime.worker.min?url';

export interface CsrSubject {
  commonName: string
  organization?: string
  organizationalUnit?: string
  country?: string
  state?: string
  locality?: string
  emailAddress?: string
}

export interface CsrInput extends CsrSubject {
  rsaBits: number
  sans: string[]
}

export interface CsrResult {
  csrPem: string
  privateKeyPem: string
}

function generateRsaKeyPair({ bits }: { bits: number }) {
  return new Promise<pki.rsa.KeyPair>((resolve, reject) =>
    pki.rsa.generateKeyPair({ bits, workerScript }, (err, keyPair) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(keyPair);
    }),
  );
}

function buildSubjectAttrs(subject: CsrSubject) {
  const attrs: { name: string; value: string }[] = [
    { name: 'commonName', value: subject.commonName },
  ];
  if (subject.organization) {
    attrs.push({ name: 'organizationName', value: subject.organization });
  }
  if (subject.organizationalUnit) {
    attrs.push({ name: 'organizationalUnitName', value: subject.organizationalUnit });
  }
  if (subject.locality) {
    attrs.push({ name: 'localityName', value: subject.locality });
  }
  if (subject.state) {
    attrs.push({ name: 'stateOrProvinceName', value: subject.state });
  }
  if (subject.country) {
    attrs.push({ name: 'countryName', value: subject.country });
  }
  if (subject.emailAddress) {
    attrs.push({ name: 'emailAddress', value: subject.emailAddress });
  }
  return attrs;
}

function parseSan(raw: string): { type: number; value?: string; ip?: string } | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  // Default to DNS if no prefix
  const match = trimmed.match(/^(DNS|IP|email|URI):(.+)$/i);
  const [type, value] = match ? [match[1].toUpperCase(), match[2]] : ['DNS', trimmed];

  switch (type) {
    case 'DNS': return { type: 2, value };
    case 'EMAIL': return { type: 1, value };
    case 'URI': return { type: 6, value };
    case 'IP': return { type: 7, ip: value };
    default: return { type: 2, value };
  }
}

export async function generateCsr({
  rsaBits,
  sans,
  ...subject
}: CsrInput): Promise<CsrResult> {
  const { privateKey, publicKey } = await generateRsaKeyPair({ bits: rsaBits });

  const csr = pki.createCertificationRequest();
  csr.publicKey = publicKey;
  csr.setSubject(buildSubjectAttrs(subject));

  const altNames = sans.map(parseSan).filter((x): x is { type: number; value?: string; ip?: string } => x !== null);
  if (altNames.length > 0) {
    // node-forge types don't expose setAttributes on CertificateRequest, but it exists at runtime.
    (csr as any).setAttributes([
      {
        name: 'extensionRequest',
        extensions: [
          {
            name: 'subjectAltName',
            altNames,
          },
        ],
      },
    ]);
  }

  csr.sign(privateKey, md.sha256.create());

  return {
    csrPem: pki.certificationRequestToPem(csr),
    privateKeyPem: pki.privateKeyToPem(privateKey),
  };
}

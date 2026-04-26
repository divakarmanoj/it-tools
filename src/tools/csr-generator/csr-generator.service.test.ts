import { pki } from 'node-forge';
import { describe, expect, it } from 'vitest';
import { generateCsr } from './csr-generator.service';

describe('csr-generator', () => {
  it('produces a CSR + private key that round-trip via node-forge', async () => {
    const { csrPem, privateKeyPem } = await generateCsr({
      commonName: 'example.com',
      organization: 'Example Inc',
      country: 'US',
      sans: ['DNS:example.com', 'DNS:www.example.com', 'IP:192.0.2.1'],
      rsaBits: 1024, // small for test speed
    });

    expect(csrPem).toMatch(/-----BEGIN CERTIFICATE REQUEST-----/);
    expect(privateKeyPem).toMatch(/-----BEGIN RSA PRIVATE KEY-----/);

    const parsed = pki.certificationRequestFromPem(csrPem);
    const cn = parsed.subject.getField('CN');
    expect(cn?.value).toBe('example.com');
    const o = parsed.subject.getField('O');
    expect(o?.value).toBe('Example Inc');
    const c = parsed.subject.getField('C');
    expect(c?.value).toBe('US');

    const privateKey = pki.privateKeyFromPem(privateKeyPem);
    expect(privateKey).toBeTruthy();
  }, 60000);
});

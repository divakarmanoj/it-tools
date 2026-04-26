import { describe, expect, it } from 'vitest';
import { compressIpv6, expandIpv6, isValidIpv6 } from './ipv6-expander.service';

describe('ipv6-expander', () => {
  describe('expandIpv6', () => {
    it('expands "::" to all-zero', () => {
      expect(expandIpv6('::')).toBe('0000:0000:0000:0000:0000:0000:0000:0000');
    });

    it('expands a typical compressed address', () => {
      expect(expandIpv6('2606:4700:4700::1111')).toBe('2606:4700:4700:0000:0000:0000:0000:1111');
    });

    it('expands localhost ::1', () => {
      expect(expandIpv6('::1')).toBe('0000:0000:0000:0000:0000:0000:0000:0001');
    });

    it('pads each hextet to 4 hex digits', () => {
      expect(expandIpv6('2001:db8::1')).toBe('2001:0db8:0000:0000:0000:0000:0000:0001');
    });

    it('passes through a fully expanded address (lowercase)', () => {
      expect(expandIpv6('FE80:0000:0000:0000:0202:B3FF:FE1E:8329'))
        .toBe('fe80:0000:0000:0000:0202:b3ff:fe1e:8329');
    });

    it('rejects two "::"', () => {
      expect(() => expandIpv6('1::1::1')).toThrow();
    });

    it('rejects bad hex', () => {
      expect(() => expandIpv6('xyz::1')).toThrow();
    });

    it('rejects too-many hextets', () => {
      expect(() => expandIpv6('1:2:3:4:5:6:7:8:9')).toThrow();
    });

    it('rejects clearly non-IPv6', () => {
      expect(() => expandIpv6('192.168.1.1')).toThrow();
    });
  });

  describe('compressIpv6', () => {
    it('compresses all-zero to ::', () => {
      expect(compressIpv6('0000:0000:0000:0000:0000:0000:0000:0000')).toBe('::');
    });

    it('compresses 2606:4700:4700:0000:0000:0000:0000:1111 → 2606:4700:4700::1111', () => {
      expect(compressIpv6('2606:4700:4700:0000:0000:0000:0000:1111')).toBe('2606:4700:4700::1111');
    });

    it('compresses ::1 round-trip', () => {
      expect(compressIpv6('0000:0000:0000:0000:0000:0000:0000:0001')).toBe('::1');
    });

    it('chooses the longest zero-run', () => {
      // shorter run before, longer run after
      expect(compressIpv6('2001:0:0:1:0:0:0:1')).toBe('2001:0:0:1::1');
    });

    it('does not compress a single zero hextet', () => {
      expect(compressIpv6('1:2:3:4:5:6:0:8')).toBe('1:2:3:4:5:6:0:8');
    });
  });

  describe('isValidIpv6', () => {
    it.each([
      ['::', true],
      ['::1', true],
      ['2606:4700:4700::1111', true],
      ['xyz::1', false],
      ['1::1::1', false],
      ['', false],
      ['192.168.1.1', false],
    ])('isValidIpv6(%j) === %s', (input, expected) => {
      expect(isValidIpv6(input)).toBe(expected);
    });
  });
});

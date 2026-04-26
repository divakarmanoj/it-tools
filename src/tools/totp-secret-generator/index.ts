import { Qrcode } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.totp-secret-generator.title'),
  path: '/totp-secret-generator',
  description: translate('tools.totp-secret-generator.description'),
  keywords: ['totp', 'hotp', 'otp', 'qr', '2fa', 'mfa', 'authenticator', 'secret', 'provisioning'],
  component: () => import('./totp-secret-generator.tool.vue'),
  icon: Qrcode,
  createdAt: new Date('2026-04-25'),
});

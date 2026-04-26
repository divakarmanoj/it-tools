import { ShieldLock } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.age-encryption.title'),
  path: '/age-encryption',
  description: translate('tools.age-encryption.description'),
  keywords: ['age', 'encryption', 'x25519', 'scrypt', 'passphrase', 'crypto', 'modern'],
  component: () => import('./age-encryption.tool.vue'),
  icon: ShieldLock,
  createdAt: new Date('2026-04-25'),
});

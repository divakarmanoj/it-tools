import { Key } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.pgp-key-generator.title'),
  path: '/pgp-key-generator',
  description: translate('tools.pgp-key-generator.description'),
  keywords: ['pgp', 'gpg', 'openpgp', 'encrypt', 'decrypt', 'key', 'curve25519', 'rsa'],
  component: () => import('./pgp-key-generator.tool.vue'),
  icon: Key,
  createdAt: new Date('2026-04-25'),
});

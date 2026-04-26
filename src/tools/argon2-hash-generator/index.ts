import { LockSquare } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.argon2-hash-generator.title'),
  path: '/argon2-hash-generator',
  description: translate('tools.argon2-hash-generator.description'),
  keywords: ['argon2', 'argon2id', 'argon2i', 'argon2d', 'hash', 'password', 'kdf', 'crypto', 'phc'],
  component: () => import('./argon2-hash-generator.tool.vue'),
  icon: LockSquare,
  createdAt: new Date('2026-04-25'),
});

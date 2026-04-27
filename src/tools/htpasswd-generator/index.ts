import { Lock } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.htpasswd-generator.title'),
  path: '/htpasswd-generator',
  description: translate('tools.htpasswd-generator.description'),
  keywords: ['htpasswd', 'apache', 'basic-auth', 'bcrypt', 'sha1', 'password'],
  component: () => import('./htpasswd-generator.tool.vue'),
  icon: Lock,
  createdAt: new Date('2026-04-26'),
});

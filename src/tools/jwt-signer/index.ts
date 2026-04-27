import { Key } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.jwt-signer.title'),
  path: '/jwt-signer',
  description: translate('tools.jwt-signer.description'),
  keywords: ['jwt', 'sign', 'verify', 'hs256', 'rs256', 'es256', 'jose', 'token'],
  component: () => import('./jwt-signer.tool.vue'),
  icon: Key,
  createdAt: new Date('2026-04-26'),
});

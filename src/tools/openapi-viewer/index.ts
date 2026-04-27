import { Api } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.openapi-viewer.title'),
  path: '/openapi-viewer',
  description: translate('tools.openapi-viewer.description'),
  keywords: ['openapi', 'swagger', 'oas', 'api', 'spec', 'validator', 'viewer'],
  component: () => import('./openapi-viewer.tool.vue'),
  icon: Api,
  createdAt: new Date('2026-04-26'),
});

import { Database } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.mock-data-generator.title'),
  path: '/mock-data-generator',
  description: translate('tools.mock-data-generator.description'),
  keywords: ['mock', 'fake', 'faker', 'data', 'generator', 'seed', 'json', 'csv', 'sql'],
  component: () => import('./mock-data-generator.tool.vue'),
  icon: Database,
  createdAt: new Date('2026-04-26'),
});

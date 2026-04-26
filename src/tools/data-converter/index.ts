import { ArrowsLeftRight } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.data-converter.title'),
  path: '/data-converter',
  description: translate('tools.data-converter.description'),
  keywords: ['data', 'converter', 'json', 'yaml', 'toml', 'xml', 'csv', 'format', 'transform'],
  component: () => import('./data-converter.tool.vue'),
  icon: ArrowsLeftRight,
  createdAt: new Date('2026-04-25'),
});

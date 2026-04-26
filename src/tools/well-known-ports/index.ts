import { ListNumbers } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.well-known-ports.title'),
  path: '/well-known-ports',
  description: translate('tools.well-known-ports.description'),
  keywords: ['ports', 'well-known', 'iana', 'reference', 'tcp', 'udp', 'service', 'protocol'],
  component: () => import('./well-known-ports.tool.vue'),
  icon: ListNumbers,
  createdAt: new Date('2026-04-26'),
});

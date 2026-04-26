import { ArrowsHorizontal } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.ipv6-expander.title'),
  path: '/ipv6-expander',
  description: translate('tools.ipv6-expander.description'),
  keywords: ['ipv6', 'expand', 'compress', 'normalize', 'rfc5952', 'address'],
  component: () => import('./ipv6-expander.tool.vue'),
  icon: ArrowsHorizontal,
  createdAt: new Date('2026-04-26'),
});

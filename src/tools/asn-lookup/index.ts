import { Affiliate } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.asn-lookup.title'),
  path: '/asn-lookup',
  description: translate('tools.asn-lookup.description'),
  keywords: ['asn', 'autonomous', 'system', 'lookup', 'bgp', 'cymru', 'ip', 'origin', 'rir'],
  component: () => import('./asn-lookup.tool.vue'),
  icon: Affiliate,
  createdAt: new Date('2026-04-26'),
});

import { ArrowBack } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.reverse-dns-lookup.title'),
  path: '/reverse-dns-lookup',
  description: translate('tools.reverse-dns-lookup.description'),
  keywords: ['reverse', 'dns', 'ptr', 'ip', 'in-addr', 'arpa', 'lookup', 'doh'],
  component: () => import('./reverse-dns-lookup.tool.vue'),
  icon: ArrowBack,
  createdAt: new Date('2026-04-26'),
});

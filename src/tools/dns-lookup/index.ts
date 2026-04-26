import { World } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.dns-lookup.title'),
  path: '/dns-lookup',
  description: translate('tools.dns-lookup.description'),
  keywords: ['dns', 'lookup', 'doh', 'dig', 'a', 'aaaa', 'mx', 'txt', 'caa', 'ns', 'soa', 'cname'],
  component: () => import('./dns-lookup.tool.vue'),
  icon: World,
  createdAt: new Date('2026-04-26'),
});

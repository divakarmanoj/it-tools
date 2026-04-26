import { Search } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.whois-lookup.title'),
  path: '/whois-lookup',
  description: translate('tools.whois-lookup.description'),
  keywords: ['whois', 'rdap', 'domain', 'ip', 'lookup', 'registrar', 'arin', 'ripe'],
  component: () => import('./whois-lookup.tool.vue'),
  icon: Search,
  createdAt: new Date('2026-04-26'),
});

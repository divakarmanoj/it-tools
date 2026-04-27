import { ShieldCheck } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.cors-tester.title'),
  path: '/cors-tester',
  description: translate('tools.cors-tester.description'),
  keywords: ['cors', 'preflight', 'options', 'origin', 'cross-origin', 'access-control'],
  component: () => import('./cors-tester.tool.vue'),
  icon: ShieldCheck,
  createdAt: new Date('2026-04-26'),
});

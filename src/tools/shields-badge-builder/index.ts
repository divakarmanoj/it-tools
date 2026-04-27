import { Award } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.shields-badge-builder.title'),
  path: '/shields-badge-builder',
  description: translate('tools.shields-badge-builder.description'),
  keywords: ['shields', 'badge', 'badges', 'shields.io', 'readme', 'markdown'],
  component: () => import('./shields-badge-builder.tool.vue'),
  icon: Award,
  createdAt: new Date('2026-04-26'),
});

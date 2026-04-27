import { Scale } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.license-chooser.title'),
  path: '/license-chooser',
  description: translate('tools.license-chooser.description'),
  keywords: ['license', 'mit', 'apache', 'gpl', 'bsd', 'mpl', 'isc', 'unlicense', 'spdx', 'open source', 'oss'],
  component: () => import('./license-chooser.tool.vue'),
  icon: Scale,
  createdAt: new Date('2026-04-26'),
});

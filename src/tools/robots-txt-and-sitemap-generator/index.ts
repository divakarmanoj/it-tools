import { Robot } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.robots-txt-and-sitemap-generator.title'),
  path: '/robots-txt-and-sitemap-generator',
  description: translate('tools.robots-txt-and-sitemap-generator.description'),
  keywords: ['robots', 'robots.txt', 'sitemap', 'sitemap.xml', 'seo', 'crawler', 'user-agent', 'validator'],
  component: () => import('./robots-txt-and-sitemap-generator.tool.vue'),
  icon: Robot,
  createdAt: new Date('2026-04-26'),
});

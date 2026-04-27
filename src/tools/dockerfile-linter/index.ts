import { BrandDocker } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.dockerfile-linter.title'),
  path: '/dockerfile-linter',
  description: translate('tools.dockerfile-linter.description'),
  keywords: ['docker', 'dockerfile', 'lint', 'linter', 'hadolint', 'best-practices'],
  component: () => import('./dockerfile-linter.tool.vue'),
  icon: BrandDocker,
  createdAt: new Date('2026-04-26'),
});

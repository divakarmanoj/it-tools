import { BrandGit } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.gitignore-generator.title'),
  path: '/gitignore-generator',
  description: translate('tools.gitignore-generator.description'),
  keywords: ['gitignore', 'git', 'ignore', 'templates', 'node', 'python', 'macos', 'windows', 'vscode', 'jetbrains'],
  component: () => import('./gitignore-generator.tool.vue'),
  icon: BrandGit,
  createdAt: new Date('2026-04-26'),
});

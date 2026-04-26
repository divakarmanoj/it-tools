import { Code } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.json-to-types.title'),
  path: '/json-to-types',
  description: translate('tools.json-to-types.description'),
  keywords: ['json', 'typescript', 'go', 'rust', 'python', 'types', 'interface', 'struct', 'dataclass', 'codegen', 'quicktype'],
  component: () => import('./json-to-types.tool.vue'),
  icon: Code,
  createdAt: new Date('2026-04-26'),
});

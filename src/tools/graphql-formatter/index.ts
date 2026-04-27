import { Hexagon } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.graphql-formatter.title'),
  path: '/graphql-formatter',
  description: translate('tools.graphql-formatter.description'),
  keywords: ['graphql', 'sdl', 'schema', 'format', 'pretty', 'query'],
  component: () => import('./graphql-formatter.tool.vue'),
  icon: Hexagon,
  createdAt: new Date('2026-04-26'),
});

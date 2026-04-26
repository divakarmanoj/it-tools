import { ChartBar } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.password-entropy-visualizer.title'),
  path: '/password-entropy-visualizer',
  description: translate('tools.password-entropy-visualizer.description'),
  keywords: ['password', 'entropy', 'strength', 'visualizer', 'crack', 'time', 'charset', 'composition'],
  component: () => import('./password-entropy-visualizer.tool.vue'),
  icon: ChartBar,
  redirectFrom: ['/password-strength-analyser'],
  createdAt: new Date('2026-04-25'),
});

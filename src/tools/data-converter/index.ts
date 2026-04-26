import { ArrowsLeftRight } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Data format converter',
  path: '/data-converter',
  description: 'Convert structured data between JSON, YAML, TOML, XML, and CSV in any direction.',
  keywords: ['data', 'converter', 'json', 'yaml', 'toml', 'xml', 'csv', 'format', 'transform'],
  component: () => import('./data-converter.tool.vue'),
  icon: ArrowsLeftRight,
  createdAt: new Date('2026-04-25'),
});

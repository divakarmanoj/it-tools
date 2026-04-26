import { Certificate } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.csr-generator.title'),
  path: '/csr-generator',
  description: translate('tools.csr-generator.description'),
  keywords: ['csr', 'certificate', 'signing', 'request', 'pkcs10', 'rsa', 'tls', 'ssl', 'x509'],
  component: () => import('./csr-generator.tool.vue'),
  icon: Certificate,
  createdAt: new Date('2026-04-25'),
});

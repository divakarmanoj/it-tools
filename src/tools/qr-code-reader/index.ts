import { Scan } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.qrcode-reader.title'),
  path: '/qrcode-reader',
  description: translate('tools.qrcode-reader.description'),
  keywords: ['qr', 'code', 'reader', 'scanner', 'decode', 'image', 'barcode'],
  component: () => import('./qr-code-reader.tool.vue'),
  icon: Scan,
  createdAt: new Date('2025-07-15'),
});

import { Dice } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.diceware-passphrase-generator.title'),
  path: '/diceware-passphrase-generator',
  description: translate('tools.diceware-passphrase-generator.description'),
  keywords: ['diceware', 'eff', 'passphrase', 'password', 'wordlist', 'entropy', 'random'],
  component: () => import('./diceware-passphrase-generator.tool.vue'),
  icon: Dice,
  createdAt: new Date('2026-04-25'),
});

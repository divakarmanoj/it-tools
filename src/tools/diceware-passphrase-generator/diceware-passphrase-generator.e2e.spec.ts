import { expect, test } from '@playwright/test';

test.describe('Tool - Diceware passphrase generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/diceware-passphrase-generator');
  });

  test('has correct title and description', async ({ page }) => {
    await expect(page).toHaveTitle('Diceware passphrase generator - IT Tools');
  });
});

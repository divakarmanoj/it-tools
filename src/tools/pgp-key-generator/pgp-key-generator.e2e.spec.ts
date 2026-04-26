import { expect, test } from '@playwright/test';

test.describe('Tool - PGP key generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pgp-key-generator');
  });

  test('has correct title and description', async ({ page }) => {
    await expect(page).toHaveTitle('PGP keypair, encrypt & decrypt - IT Tools');
  });
});

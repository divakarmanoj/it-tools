import { expect, test } from '@playwright/test';

test.describe('Tool - TOTP/HOTP secret + QR generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/totp-secret-generator');
  });

  test('has correct title and description', async ({ page }) => {
    await expect(page).toHaveTitle('TOTP / HOTP secret + QR generator - IT Tools');
  });
});

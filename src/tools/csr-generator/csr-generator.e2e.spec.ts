import { expect, test } from '@playwright/test';

test.describe('Tool - CSR generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/csr-generator');
  });

  test('has correct title and description', async ({ page }) => {
    await expect(page).toHaveTitle('Certificate Signing Request (CSR) generator - IT Tools');
  });
});

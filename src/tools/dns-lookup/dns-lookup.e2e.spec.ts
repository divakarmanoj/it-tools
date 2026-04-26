import { expect, test } from '@playwright/test';

test.describe('Tool - DNS lookup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dns-lookup');
  });

  test('has correct title and description', async ({ page }) => {
    await expect(page).toHaveTitle('DNS lookup (DoH) - IT Tools');
  });
});

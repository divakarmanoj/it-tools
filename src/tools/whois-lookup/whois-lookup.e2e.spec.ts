import { expect, test } from '@playwright/test';

test.describe('Tool - WHOIS / RDAP lookup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/whois-lookup');
  });

  test('has correct title and description', async ({ page }) => {
    await expect(page).toHaveTitle('WHOIS / RDAP lookup - IT Tools');
  });
});

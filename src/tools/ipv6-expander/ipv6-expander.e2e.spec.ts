import { expect, test } from '@playwright/test';

test.describe('Tool - IPv6 expand/compress', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ipv6-expander');
  });

  test('has correct title and description', async ({ page }) => {
    await expect(page).toHaveTitle('IPv6 expand & compress - IT Tools');
  });
});

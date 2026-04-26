import { expect, test } from '@playwright/test';

test.describe('Tool - Reverse DNS lookup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reverse-dns-lookup');
  });

  test('has correct title and description', async ({ page }) => {
    await expect(page).toHaveTitle('Reverse DNS (PTR) lookup - IT Tools');
  });
});

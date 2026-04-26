import { expect, test } from '@playwright/test';

test.describe('Tool - JSON to language types', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/json-to-types');
  });

  test('has correct title and description', async ({ page }) => {
    await expect(page).toHaveTitle('JSON to TypeScript / Go / Rust / Python types - IT Tools');
  });
});

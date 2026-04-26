import { expect, test } from '@playwright/test';

test.describe('Tool - Argon2 hash generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/argon2-hash-generator');
  });

  test('has correct title and description', async ({ page }) => {
    await expect(page).toHaveTitle('Argon2 hash & verify - IT Tools');
  });
});

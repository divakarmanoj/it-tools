import { expect, test } from '@playwright/test';

test.describe('Tool - age encryption', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/age-encryption');
  });

  test('has correct title and description', async ({ page }) => {
    await expect(page).toHaveTitle('age encryption (encrypt & decrypt) - IT Tools');
  });
});

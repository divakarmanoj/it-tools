import { expect, test } from '@playwright/test';

test.describe('Tool - Password entropy visualizer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/password-entropy-visualizer');
  });

  test('has correct title and description', async ({ page }) => {
    await expect(page).toHaveTitle('Password entropy visualizer - IT Tools');
  });
});

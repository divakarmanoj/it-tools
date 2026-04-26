import { expect, test } from '@playwright/test';

test.describe('Tool - Well-known ports reference', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/well-known-ports');
  });

  test('has correct title and description', async ({ page }) => {
    await expect(page).toHaveTitle('Well-known ports reference - IT Tools');
  });
});

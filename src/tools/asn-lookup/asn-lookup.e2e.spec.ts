import { expect, test } from '@playwright/test';

test.describe('Tool - ASN lookup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/asn-lookup');
  });

  test('has correct title and description', async ({ page }) => {
    await expect(page).toHaveTitle('ASN lookup - IT Tools');
  });
});

import { expect, test } from '@playwright/test';

test.describe('Tool - Data format converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/data-converter');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Data format converter - IT Tools');
  });

  test('Default JSON input renders YAML output', async ({ page }) => {
    const output = (await page.getByTestId('area-content').innerText()).trim();
    expect(output).toContain('hello: world');
    expect(output).toContain('items:');
  });

  test('Switching the target format updates the output', async ({ page }) => {
    await page.getByTestId('input').fill('{"a":1,"b":2}');

    const yamlOutput = (await page.getByTestId('area-content').innerText()).trim();
    expect(yamlOutput).toBe('a: 1\nb: 2');
  });
});

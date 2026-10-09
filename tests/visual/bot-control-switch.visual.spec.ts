import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('BotControlSwitch — multi-instance rendering and a11y', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('all active Bot buttons render solid dark background with white text', async ({ page }) => {
    const botButtons = page.getByRole('button', { name: /^bot$/i });
    const count = await botButtons.count();
    expect(count).toBeGreaterThan(0);

    for (const button of await botButtons.all()) {
      if (await button.isVisible()) {
        const isPressed = await button.getAttribute('aria-pressed');
        if (isPressed === 'true') {
          await expect(button).toHaveCSS('background-color', 'rgb(15, 23, 42)'); // slate-900
          await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)');
        }
      }
    }
  });

  test('passes axe color-contrast rule on all instances', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});

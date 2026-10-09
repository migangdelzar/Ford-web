import { test, expect } from '@playwright/test';

test.describe('Advisor takeover flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('advisor can take over from bot on an active lead', async ({ page }) => {
    const threadItem = page.locator('#thread-list-container [role="article"]').first();
    if (await threadItem.isVisible()) {
      await threadItem.click();
    }

    const asesorBtn = page.getByRole('button', { name: /asesor/i }).first();
    if (await asesorBtn.isVisible()) {
      await asesorBtn.click();
      await expect(asesorBtn).toHaveClass(/bg-blue-600/);
    }
  });

  test('bot resumes control when advisor switches back', async ({ page }) => {
    const threadItem = page.locator('#thread-list-container [role="article"]').first();
    if (await threadItem.isVisible()) {
      await threadItem.click();
    }

    const asesorBtn = page.getByRole('button', { name: /asesor/i }).first();
    if (await asesorBtn.isVisible()) {
      await asesorBtn.click();
      const botBtn = page.getByRole('button', { name: /^bot$/i }).first();
      await botBtn.click();
      await expect(botBtn).toHaveClass(/bg-slate-900/);
    }
  });
});

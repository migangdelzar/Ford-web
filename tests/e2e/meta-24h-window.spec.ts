import { test, expect } from '@playwright/test';

test.describe('Meta 24h window — HSM template fallback and SLA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays Meta window badge and status in active thread', async ({ page }) => {
    const threadItem = page.locator('#thread-list-container [role="article"]').first();
    if (await threadItem.isVisible()) {
      await threadItem.click();
    }
    const windowBadge = page.locator('text=/24h/i').first();
    await expect(windowBadge).toBeVisible();
  });
});

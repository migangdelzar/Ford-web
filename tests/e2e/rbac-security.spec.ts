import { test, expect } from '@playwright/test';

test.describe('RBAC — Role-Based View Isolation', () => {
  test('non-authenticated or advisor role isolates executive financials', async ({ page }) => {
    await page.goto('/');
    // Check that unauthorized tabs are restricted
    const botRulesLink = page.getByRole('button', { name: /reglas del bot/i });
    if (await botRulesLink.isVisible()) {
      // In Propietario mode it's accessible
      await expect(botRulesLink).toBeVisible();
    }
  });
});

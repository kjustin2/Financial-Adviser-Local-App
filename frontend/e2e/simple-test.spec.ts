import { test, expect } from '@playwright/test';

test.describe('Basic Application Tests', () => {
  test('should load login page without backend', async ({ page }) => {
    // Mock auth endpoint to prevent network errors
    await page.route('**/api/v1/auth/me', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Not authenticated' })
      });
    });

    await page.goto('/');
    
    // Should redirect to login page
    await expect(page).toHaveURL(/.*\/login/);
    
    // Check that basic UI elements are present
    await expect(page.locator('h3').first()).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.route('**/api/v1/auth/me', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Not authenticated' })
      });
    });

    await page.goto('/login');
    await page.click('text=Sign up');
    await expect(page).toHaveURL(/.*\/register/);
    await expect(page.locator('h3').first()).toBeVisible();
  });

  test('should validate form fields exist', async ({ page }) => {
    await page.route('**/api/v1/auth/me', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Not authenticated' })
      });
    });

    await page.goto('/register');
    
    // Check form fields exist
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
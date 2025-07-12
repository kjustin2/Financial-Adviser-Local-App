import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should redirect to login page when not authenticated', async ({ page }) => {
    // Should be redirected to login page
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.locator('h3').first()).toContainText('Financial Adviser');
  });

  test('should show register page when clicking register link', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Sign up');
    await expect(page).toHaveURL(/.*\/register/);
    await expect(page.locator('h3').first()).toContainText('Create Your Investment Account');
  });

  test('should display validation errors for empty login form', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');
    
    // Check for validation errors
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should display validation errors for invalid email format', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Invalid email format')).toBeVisible();
  });

  test('should display error for incorrect credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'nonexistent@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Wait for error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });

  test('should show loading state during login attempt', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Click submit and immediately check for loading state
    await page.click('button[type="submit"]');
    await expect(page.locator('button:has-text("Signing in...")')).toBeVisible();
  });

  test('should validate register form fields', async ({ page }) => {
    await page.goto('/register');
    await page.click('button[type="submit"]');
    
    // Check for validation errors on required fields
    await expect(page.locator('text=First name is required')).toBeVisible();
    await expect(page.locator('text=Last name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should validate password requirements', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[type="email"]', 'john@example.com');
    await page.fill('input[type="password"]', '123'); // Too short
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
  });

  test('should navigate between login and register pages', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h3').first()).toContainText('Financial Adviser');
    
    await page.click('text=Sign up');
    await expect(page).toHaveURL(/.*\/register/);
    await expect(page.locator('h3').first()).toContainText('Create Your Investment Account');
    
    await page.click('text=Sign in');
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.locator('h3').first()).toContainText('Financial Adviser');
  });
});
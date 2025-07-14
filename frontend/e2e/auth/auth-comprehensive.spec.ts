import { test, expect } from '@playwright/test';
import { AuthFixture, testUsers } from '../fixtures/auth';
import { ApiMocks } from '../fixtures/api-mocks';

test.describe('Comprehensive Authentication Tests', () => {
  let authFixture: AuthFixture;
  let apiMocks: ApiMocks;

  test.beforeEach(async ({ page }) => {
    authFixture = new AuthFixture(page);
    apiMocks = new ApiMocks(page);
    await apiMocks.enableAllMocks();
  });

  test.describe('Login Page Tests', () => {
    test('should display login page correctly', async ({ page }) => {
      await page.goto('/login');
      
      await expect(page).toHaveTitle(/Financial Adviser/);
      await expect(page.locator('h3:has-text("Financial Adviser")')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      await expect(page.locator('text=Sign up')).toBeVisible();
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.goto('/login');
      await page.click('button[type="submit"]');
      
      await expect(page.locator('.text-red-500:has-text("Email is required")')).toBeVisible();
      await expect(page.locator('.text-red-500:has-text("Password is required")')).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'invalid-email');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Should stay on login page due to validation
      await expect(page).toHaveURL(/.*\/login/);
    });

    test('should show error for incorrect credentials', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'wrong@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      await expect(page.locator('.text-red-600')).toBeVisible();
    });

    test('should show loading state during login', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', testUsers.standard.email);
      await page.fill('input[type="password"]', testUsers.standard.password);
      
      await page.click('button[type="submit"]');
      await expect(page.locator('button:has-text("Signing in...")')).toBeVisible();
    });

    test('should login successfully with valid credentials', async ({ page }) => {
      await authFixture.loginUser(testUsers.standard);
      await expect(page).toHaveURL('/');
      await expect(page.locator('h2:has-text("Dashboard")')).toBeVisible();
    });

    test('should remember login state', async ({ page, context }) => {
      await authFixture.loginUser(testUsers.standard);
      
      // Create new page in same context
      const newPage = await context.newPage();
      await newPage.goto('/');
      
      // Should stay logged in
      await expect(newPage).toHaveURL('/');
      await expect(newPage.locator('h2:has-text("Dashboard")')).toBeVisible();
    });
  });

  test.describe('Registration Page Tests', () => {
    test('should display registration page correctly', async ({ page }) => {
      await page.goto('/register');
      
      await expect(page.locator('h3:has-text("Create Your Investment Account")')).toBeVisible();
      await expect(page.locator('input[name="firstName"]')).toBeVisible();
      await expect(page.locator('input[name="lastName"]')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      await expect(page.locator('text=Sign in')).toBeVisible();
    });

    test('should validate all required fields', async ({ page }) => {
      await page.goto('/register');
      await page.click('button[type="submit"]');
      
      // Should stay on register page
      await expect(page).toHaveURL(/.*\/register/);
      await expect(page.locator('input[name="firstName"]')).toHaveValue('');
    });

    test('should validate password requirements', async ({ page }) => {
      await page.goto('/register');
      await page.fill('input[name="firstName"]', 'John');
      await page.fill('input[name="lastName"]', 'Doe');
      await page.fill('input[type="email"]', 'john@example.com');
      await page.fill('input[name="password"]', '123');
      await page.click('button[type="submit"]');
      
      await expect(page.locator('.text-red-600:has-text("Password must be at least 8 characters")')).toBeVisible();
    });

    test('should register successfully with valid data', async ({ page }) => {
      await authFixture.registerUser(testUsers.premium);
      await expect(page).toHaveURL('/');
      await expect(page.locator('h2:has-text("Dashboard")')).toBeVisible();
    });

    test('should show loading state during registration', async ({ page }) => {
      await page.goto('/register');
      await page.fill('input[name="firstName"]', testUsers.investor.firstName);
      await page.fill('input[name="lastName"]', testUsers.investor.lastName);
      await page.fill('input[type="email"]', testUsers.investor.email);
      await page.fill('input[name="password"]', testUsers.investor.password);
      
      await page.click('button[type="submit"]');
      await expect(page.locator('button:has-text("Creating Account...")')).toBeVisible();
    });

    test('should handle registration with optional fields', async ({ page }) => {
      await page.goto('/register');
      await page.fill('input[name="firstName"]', testUsers.investor.firstName);
      await page.fill('input[name="lastName"]', testUsers.investor.lastName);
      await page.fill('input[type="email"]', testUsers.investor.email);
      await page.fill('input[name="phone"]', testUsers.investor.phone || '');
      await page.fill('input[name="dateOfBirth"]', testUsers.investor.dateOfBirth || '');
      await page.fill('input[name="password"]', testUsers.investor.password);
      await page.click('button[type="submit"]');
      
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Navigation Between Auth Pages', () => {
    test('should navigate from login to register', async ({ page }) => {
      await page.goto('/login');
      await page.click('text=Sign up');
      
      await expect(page).toHaveURL(/.*\/register/);
      await expect(page.locator('h3:has-text("Create Your Investment Account")')).toBeVisible();
    });

    test('should navigate from register to login', async ({ page }) => {
      await page.goto('/register');
      await page.click('text=Sign in');
      
      await expect(page).toHaveURL(/.*\/login/);
      await expect(page.locator('h3:has-text("Financial Adviser")')).toBeVisible();
    });

    test('should redirect unauthenticated users to login', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL(/.*\/login/);
      
      await page.goto('/portfolios');
      await expect(page).toHaveURL(/.*\/login/);
      
      await page.goto('/goals');
      await expect(page).toHaveURL(/.*\/login/);
    });
  });

  test.describe('Logout Functionality', () => {
    test('should logout successfully', async ({ page }) => {
      await authFixture.loginUser(testUsers.standard);
      await authFixture.logout();
      
      await expect(page).toHaveURL(/.*\/login/);
    });

    test('should clear session data on logout', async ({ page, context }) => {
      await authFixture.loginUser(testUsers.standard);
      await authFixture.logout();
      
      // Try to access protected route
      await page.goto('/');
      await expect(page).toHaveURL(/.*\/login/);
    });

    test('should logout from any page', async ({ page }) => {
      await authFixture.loginUser(testUsers.standard);
      
      // Navigate to different pages and logout
      await page.goto('/portfolios');
      await authFixture.logout();
      await expect(page).toHaveURL(/.*\/login/);
    });
  });

  test.describe('Session Management', () => {
    test('should maintain session across page refreshes', async ({ page }) => {
      await authFixture.loginUser(testUsers.standard);
      
      await page.reload();
      await expect(page).toHaveURL('/');
      await expect(page.locator('h2:has-text("Dashboard")')).toBeVisible();
    });

    test('should handle expired sessions gracefully', async ({ page }) => {
      await authFixture.loginUser(testUsers.standard);
      
      // Simulate expired token by clearing storage
      await page.evaluate(() => {
        localStorage.removeItem('token');
      });
      
      await page.reload();
      await expect(page).toHaveURL(/.*\/login/);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors during login', async ({ page }) => {
      await apiMocks.mockApiError('**/api/v1/auth/login', 500);
      
      await page.goto('/login');
      await page.fill('input[type="email"]', testUsers.standard.email);
      await page.fill('input[type="password"]', testUsers.standard.password);
      await page.click('button[type="submit"]');
      
      await expect(page.locator('.text-red-600')).toBeVisible();
    });

    test('should handle network errors during registration', async ({ page }) => {
      await apiMocks.mockApiError('**/api/v1/auth/register', 500);
      
      await page.goto('/register');
      await page.fill('input[name="firstName"]', testUsers.premium.firstName);
      await page.fill('input[name="lastName"]', testUsers.premium.lastName);
      await page.fill('input[type="email"]', testUsers.premium.email);
      await page.fill('input[name="password"]', testUsers.premium.password);
      await page.click('button[type="submit"]');
      
      await expect(page.locator('.text-red-600')).toBeVisible();
    });

    test('should handle timeout errors', async ({ page }) => {
      await apiMocks.mockApiTimeout('**/api/v1/auth/login');
      
      await page.goto('/login');
      await page.fill('input[type="email"]', testUsers.standard.email);
      await page.fill('input[type="password"]', testUsers.standard.password);
      await page.click('button[type="submit"]');
      
      // Should eventually show error or timeout message
      await expect(page.locator('.text-red-600')).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper form labels and accessibility', async ({ page }) => {
      await page.goto('/login');
      
      // Check for proper labeling
      await expect(page.locator('label[for="email"]')).toBeVisible();
      await expect(page.locator('label[for="password"]')).toBeVisible();
      
      // Check for ARIA attributes
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toHaveAttribute('aria-required', 'true');
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/login');
      
      // Tab through form elements
      await page.press('body', 'Tab');
      await expect(page.locator('input[type="email"]')).toBeFocused();
      
      await page.press('input[type="email"]', 'Tab');
      await expect(page.locator('input[type="password"]')).toBeFocused();
      
      await page.press('input[type="password"]', 'Tab');
      await expect(page.locator('button[type="submit"]')).toBeFocused();
    });
  });
});
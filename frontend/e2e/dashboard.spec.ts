import { test, expect } from '@playwright/test';

// Mock user for authenticated tests
const mockUser = {
  email: 'test@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe'
};

const mockUserResponse = {
  id: 1,
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  phone: null,
  investment_experience: 'intermediate',
  risk_tolerance: 'moderate',
  investment_style: null,
  financial_goals: null,
  net_worth_range: null,
  time_horizon: 'long_term',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the authentication API responses with correct format
    await page.route('**/api/v1/auth/login/json', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-jwt-token-12345',
          token_type: 'bearer',
          expires_in: 3600,
          user: mockUserResponse
        })
      });
    });

    await page.route('**/api/v1/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockUserResponse)
      });
    });

    // Mock empty portfolios response
    await page.route('**/api/v1/portfolios/', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          portfolios: [],
          total_count: 0,
          total_value: 0,
          total_gain_loss: 0,
          total_return_percent: 0,
          portfolios_count: 0
        })
      });
    });

    // Mock empty goals response
    await page.route('**/api/v1/goals/', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          goals: [],
          total_count: 0,
          average_progress: 0
        })
      });
    });

    // Mock recommendations response
    await page.route('**/api/v1/recommendations/', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          recommendations: [
            {
              type: 'asset_allocation',
              priority: 'high',
              title: 'Create Your First Investment Portfolio',
              description: 'Based on your age and moderate risk tolerance, we recommend starting with a diversified portfolio.',
              action: 'Create a new portfolio with the recommended asset allocation',
              reason: 'Having a diversified investment portfolio is essential for long-term wealth building',
              estimated_impact: 'Could potentially grow your wealth by 7-10% annually over the long term'
            }
          ],
          total_count: 1,
          high_priority_count: 1,
          medium_priority_count: 0,
          low_priority_count: 0
        })
      });
    });

    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', mockUser.email);
    await page.fill('input[type="password"]', mockUser.password);
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('/');
  });

  test('should display dashboard with welcome message', async ({ page }) => {
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('text=Welcome back! Here\'s an overview')).toBeVisible();
  });

  test('should display portfolio summary cards with zero values', async ({ page }) => {
    // Check that portfolio cards are displayed with zero values
    await expect(page.locator('text=Total Portfolio Value')).toBeVisible();
    await expect(page.locator('text=$0.00').first()).toBeVisible();
    
    await expect(page.locator('text=Total Gain/Loss')).toBeVisible();
    await expect(page.locator('text=Active Portfolios')).toBeVisible();
  });

  test('should display empty state for recent transactions', async ({ page }) => {
    await expect(page.locator('h3:has-text("Recent Transactions")')).toBeVisible();
    await expect(page.locator('text=No recent transactions')).toBeVisible();
    await expect(page.locator('text=Transactions will appear here once you start investing')).toBeVisible();
  });

  test('should display investment recommendations', async ({ page }) => {
    await expect(page.locator('text=Investment Recommendations')).toBeVisible();
    await expect(page.locator('text=Create Your First Investment Portfolio')).toBeVisible();
    await expect(page.locator('text=1 urgent')).toBeVisible();
    await expect(page.locator('text=1 total')).toBeVisible();
  });

  test('should display portfolio performance placeholder', async ({ page }) => {
    await expect(page.locator('h3:has-text("Portfolio Performance")')).toBeVisible();
    await expect(page.locator('text=Portfolio performance chart coming soon')).toBeVisible();
  });

  test('should navigate to portfolios page', async ({ page }) => {
    // Click on portfolios in sidebar
    await page.click('text=My Portfolios');
    await expect(page).toHaveURL('/portfolios');
    await expect(page.locator('h1:has-text("My Portfolios")')).toBeVisible();
  });

  test('should navigate to goals page', async ({ page }) => {
    // Click on goals in sidebar  
    await page.click('text=My Goals');
    await expect(page).toHaveURL('/goals');
    // Just check that we navigated successfully - the goals page might have different title
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should open user menu and navigate to settings', async ({ page }) => {
    // Click on account button
    await page.click('button:has-text("Account")');
    await expect(page.locator('text=Profile Settings')).toBeVisible();
    
    // Click profile settings
    await page.click('text=Profile Settings');
    await expect(page).toHaveURL('/settings');
    await expect(page.locator('h1:has-text("Profile Settings")')).toBeVisible();
  });

  test('should logout from user menu', async ({ page }) => {
    // Mock logout response
    await page.route('**/api/v1/auth/logout', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Logged out successfully' })
      });
    });

    // Click on account button
    await page.click('button:has-text("Account")');
    await expect(page.locator('text=Sign out')).toBeVisible();
    
    // Click sign out
    await page.click('text=Sign out');
    
    // Should redirect to login page
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should display loading states initially', async ({ page }) => {
    // Remove API mocks to see loading states
    await page.unroute('**/api/v1/portfolios/');
    await page.goto('/');
    
    // Should show loading message initially (this might be very quick)
    await expect(page.locator('text=Loading your portfolio data...')).toBeVisible({ timeout: 1000 });
  });
});
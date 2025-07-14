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

test.describe('Portfolio Management', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication with correct format
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

    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', mockUser.email);
    await page.fill('input[type="password"]', mockUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should display empty portfolio state', async ({ page }) => {
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

    await page.goto('/portfolios');
    
    await expect(page.locator('h1:has-text("My Portfolios")')).toBeVisible();
    await expect(page.locator('text=No portfolios yet')).toBeVisible();
    await expect(page.locator('text=Get started by creating your first investment portfolio')).toBeVisible();
    await expect(page.locator('button:has-text("Create Your First Portfolio")')).toBeVisible();
  });

  test('should open create portfolio modal', async ({ page }) => {
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

    await page.goto('/portfolios');
    
    // Click the create portfolio button
    await page.click('button:has-text("Create Your First Portfolio")');
    
    // Check that modal opened
    await expect(page.locator('text=Create New Portfolio')).toBeVisible();
    await expect(page.locator('text=Add a new investment portfolio')).toBeVisible();
    await expect(page.locator('input[placeholder*="Growth Portfolio"]')).toBeVisible();
  });

  test('should validate portfolio creation form', async ({ page }) => {
    await page.route('**/api/v1/portfolios/', async route => {
      if (route.request().method() === 'GET') {
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
      }
    });

    await page.goto('/portfolios');
    await page.click('button:has-text("Create Your First Portfolio")');
    
    // Check that the submit button is disabled for empty form
    await expect(page.locator('button:has-text("Create Portfolio")')).toBeDisabled();
    
    // Modal should still be visible since form is invalid
    await expect(page.locator('text=Create New Portfolio')).toBeVisible();
  });

  test('should create a new portfolio', async ({ page }) => {
    // Mock GET request for empty portfolios
    await page.route('**/api/v1/portfolios/', async route => {
      if (route.request().method() === 'GET') {
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
      } else if (route.request().method() === 'POST') {
        // Mock successful portfolio creation
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            name: 'Test Portfolio',
            description: 'A test portfolio',
            portfolio_type: 'investment',
            risk_level: 'moderate',
            current_value: 0,
            total_cost_basis: 0,
            unrealized_gain_loss: 0,
            unrealized_return_percent: 0,
            holdings_count: 0
          })
        });
      }
    });

    await page.goto('/portfolios');
    await page.click('button:has-text("Create Your First Portfolio")');
    
    // Fill out the form
    await page.fill('input[placeholder*="Growth Portfolio"]', 'Test Portfolio');
    await page.fill('textarea[placeholder*="Brief description"]', 'A test portfolio for e2e testing');
    await page.selectOption('select', { label: 'Investment' });
    
    // Submit the form
    await page.click('button:has-text("Create Portfolio")');
    
    // Modal should close (wait for it to disappear)
    await expect(page.locator('text=Create New Portfolio')).not.toBeVisible();
  });

  test('should display portfolio list with data', async ({ page }) => {
    // Mock portfolios with data
    await page.route('**/api/v1/portfolios/', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          portfolios: [
            {
              id: 1,
              name: 'Growth Portfolio',
              portfolio_type: 'investment',
              current_value: 125000,
              unrealized_gain_loss: 15000,
              unrealized_return_percent: 13.6,
              holdings_count: 8,
              last_updated: '2025-01-07T10:30:00Z'
            },
            {
              id: 2,
              name: 'Retirement 401k',
              portfolio_type: 'retirement',
              current_value: 75000,
              unrealized_gain_loss: -2500,
              unrealized_return_percent: -3.2,
              holdings_count: 5,
              last_updated: '2025-01-07T10:30:00Z'
            }
          ],
          total_count: 2,
          total_value: 200000,
          total_gain_loss: 12500,
          total_return_percent: 6.67,
          portfolios_count: 2
        })
      });
    });

    await page.goto('/portfolios');
    
    // Check summary cards
    await expect(page.locator('text=Total Value')).toBeVisible();
    await expect(page.locator('text=$200,000.00')).toBeVisible();
    
    await expect(page.locator('text=Total Gain/Loss')).toBeVisible();
    await expect(page.locator('text=$12,500.00')).toBeVisible();
    
    await expect(page.locator('text=Total Return')).toBeVisible();
    await expect(page.locator('text=+6.67%')).toBeVisible();
    
    // Check portfolio cards
    await expect(page.locator('text=Growth Portfolio')).toBeVisible();
    await expect(page.locator('text=Retirement 401k')).toBeVisible();
    await expect(page.locator('text=$125,000.00')).toBeVisible();
    await expect(page.locator('text=$75,000.00')).toBeVisible();
    await expect(page.locator('text=8 holdings')).toBeVisible();
    await expect(page.locator('text=5 holdings')).toBeVisible();
  });

  test('should handle portfolio loading error', async ({ page }) => {
    // Mock API error
    await page.route('**/api/v1/portfolios/', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Internal server error' })
      });
    });

    await page.goto('/portfolios');
    
    await expect(page.locator('h1:has-text("My Portfolios")')).toBeVisible();
    // Check that page loads despite error - page should still show portfolios header
    await expect(page.locator('h1:has-text("My Portfolios")')).toBeVisible();
  });

  test('should show loading state', async ({ page }) => {
    // Delay the API response to see loading state
    await page.route('**/api/v1/portfolios/', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
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

    await page.goto('/portfolios');
    
    // Should show loading state initially
    await expect(page.locator('text=Loading your portfolios...')).toBeVisible();
    await expect(page.locator('.animate-pulse').first()).toBeVisible();
  });

  test('should close modal with cancel button', async ({ page }) => {
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

    await page.goto('/portfolios');
    await page.click('button:has-text("Create Your First Portfolio")');
    
    // Check modal is open
    await expect(page.locator('text=Create New Portfolio')).toBeVisible();
    
    // Click cancel
    await page.click('button:has-text("Cancel")');
    
    // Modal should close
    await expect(page.locator('text=Create New Portfolio')).not.toBeVisible();
  });

  test('regression test: percentage formatting should not cause JavaScript errors', async ({ page }) => {
    // This test verifies that the percent.toFixed JavaScript error from the screenshot is fixed
    
    // Listen for JavaScript errors that contain our specific error pattern
    const jsErrors = [];
    page.on('pageerror', (error) => {
      if (error.message.includes('toFixed') || error.message.includes('percent')) {
        jsErrors.push(error.message);
      }
    });

    // Just run the normal portfolio test - if there are percentage formatting errors,
    // they'll be caught by our error listener above
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

    await page.goto('/portfolios');
    await expect(page.locator('h1:has-text("My Portfolios")')).toBeVisible();
    
    // The key assertion: no percent.toFixed errors should occur
    expect(jsErrors).toHaveLength(0);
  });
});
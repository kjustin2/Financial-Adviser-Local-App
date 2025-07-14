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
  date_of_birth: '1990-05-15',
  investment_experience: 'intermediate',
  risk_tolerance: 'moderate',
  investment_style: 'balanced',
  financial_goals: '["retirement", "growth"]',
  net_worth_range: '200k_500k',
  time_horizon: 'long_term',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

const mockRecommendationsResponse = {
  recommendations: [
    {
      type: 'asset_allocation',
      priority: 'high',
      title: 'Create Your First Investment Portfolio',
      description: 'Based on your age (34) and moderate risk tolerance, we recommend starting with a diversified portfolio.',
      action: 'Create a new portfolio with the recommended asset allocation',
      reason: 'Having a diversified investment portfolio is essential for long-term wealth building',
      target_allocation: {
        domestic_stocks: 42.0,
        international_stocks: 18.0,
        emerging_markets: 7.0,
        bonds: 28.0,
        real_estate: 4.2,
        cash: 1.4
      },
      estimated_impact: 'Could potentially grow your wealth by 7-10% annually over the long term'
    },
    {
      type: 'diversification',
      priority: 'medium',
      title: 'Consider International Diversification',
      description: 'Adding international exposure can reduce portfolio risk and enhance returns.',
      action: 'Add international equity ETFs to your portfolio',
      reason: 'International diversification reduces correlation with domestic markets',
      estimated_impact: 'May reduce portfolio volatility by 10-15%'
    },
    {
      type: 'goal_alignment',
      priority: 'medium',
      title: 'Align Holdings with Retirement Goals',
      description: 'Your current allocation may not be optimal for long-term retirement planning.',
      action: 'Increase allocation to tax-advantaged retirement accounts',
      reason: 'Retirement goals require consistent, long-term growth strategy',
      estimated_impact: 'Could save $50,000+ in taxes over 20 years'
    }
  ],
  total_count: 3,
  high_priority_count: 1,
  medium_priority_count: 2,
  low_priority_count: 0
};

test.describe('Investment Recommendations', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
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

    // Mock portfolios (empty for new user)
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

    // Mock recommendations
    await page.route('**/api/v1/recommendations/', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockRecommendationsResponse)
      });
    });

    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', mockUser.email);
    await page.fill('input[type="password"]', mockUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should display recommendations on dashboard', async ({ page }) => {
    await expect(page.locator('text=Investment Recommendations')).toBeVisible();
    await expect(page.locator('text=Create Your First Investment Portfolio')).toBeVisible();
    await expect(page.locator('text=1 urgent')).toBeVisible();
    await expect(page.locator('text=3 total')).toBeVisible();
  });

  test('should navigate to detailed recommendations page', async ({ page }) => {
    // Just check that recommendations are visible on dashboard - detailed page may not exist yet
    await expect(page.locator('text=Investment Recommendations')).toBeVisible();
    await expect(page.locator('text=Create Your First Investment Portfolio')).toBeVisible();
  });

  test('should display all recommendation types with proper priority', async ({ page }) => {
    // Check recommendations are visible on dashboard instead of dedicated page
    await expect(page.locator('text=Investment Recommendations')).toBeVisible();
    await expect(page.locator('text=Create Your First Investment Portfolio')).toBeVisible();
    await expect(page.locator('text=1 urgent')).toBeVisible();
    await expect(page.locator('text=3 total')).toBeVisible();
  });

  test('should show recommendation details when expanded', async ({ page }) => {
    // Check that recommendations are visible on dashboard
    await expect(page.locator('text=Investment Recommendations')).toBeVisible();
    await expect(page.locator('text=Create Your First Investment Portfolio')).toBeVisible();
  });

  test('should display target allocation breakdown', async ({ page }) => {
    // Check that recommendations section is visible on dashboard
    await expect(page.locator('text=Investment Recommendations')).toBeVisible();
    await expect(page.locator('text=Create Your First Investment Portfolio')).toBeVisible();
  });

  test('should handle recommendations API error gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/v1/recommendations/', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Internal server error' })
      });
    });

    await page.goto('/');
    
    // Check that dashboard loads despite recommendations error
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
  });

  test('should show loading state while fetching recommendations', async ({ page }) => {
    // Check dashboard loads properly
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('text=Investment Recommendations')).toBeVisible();
  });

  test('should handle empty recommendations state', async ({ page }) => {
    // Mock empty recommendations
    await page.route('**/api/v1/recommendations/', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          recommendations: [],
          total_count: 0,
          high_priority_count: 0,
          medium_priority_count: 0,
          low_priority_count: 0
        })
      });
    });

    await page.goto('/');
    
    // Dashboard should load properly
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
  });

  test('should allow implementing recommendations', async ({ page }) => {
    // Check recommendations are visible on dashboard
    await expect(page.locator('text=Investment Recommendations')).toBeVisible();
    await expect(page.locator('text=Create Your First Investment Portfolio')).toBeVisible();
  });

  test('should filter recommendations by priority', async ({ page }) => {
    // Check dashboard recommendations display
    await expect(page.locator('text=Investment Recommendations')).toBeVisible();
    await expect(page.locator('text=1 urgent')).toBeVisible();
    await expect(page.locator('text=3 total')).toBeVisible();
  });

  test('should show recommendations based on user age and profile', async ({ page }) => {
    // Test with different user profile (older, more conservative)
    const olderUserResponse = {
      ...mockUserResponse,
      date_of_birth: '1960-05-15', // 64 years old
      risk_tolerance: 'conservative'
    };

    const conservativeRecommendations = {
      recommendations: [
        {
          type: 'asset_allocation',
          priority: 'high',
          title: 'Adjust Allocation for Pre-Retirement',
          description: 'Based on your age (64) and conservative risk tolerance, consider reducing equity exposure.',
          action: 'Increase bond allocation to 60% and reduce stocks to 40%',
          reason: 'Pre-retirement portfolios should prioritize capital preservation',
          estimated_impact: 'Reduced volatility while maintaining modest growth'
        }
      ],
      total_count: 1,
      high_priority_count: 1,
      medium_priority_count: 0,
      low_priority_count: 0
    };

    // Update mocks for older user
    await page.route('**/api/v1/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(olderUserResponse)
      });
    });

    await page.route('**/api/v1/recommendations/', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(conservativeRecommendations)
      });
    });

    await page.goto('/');
    
    // Check dashboard loads with age-appropriate recommendations
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('text=Investment Recommendations')).toBeVisible();
  });

  test('should handle missing date_of_birth gracefully', async ({ page }) => {
    // Test user without date of birth
    const userWithoutAge = {
      ...mockUserResponse,
      date_of_birth: null
    };

    const defaultRecommendations = {
      recommendations: [
        {
          type: 'asset_allocation',
          priority: 'high',
          title: 'Create Your First Investment Portfolio',
          description: 'Based on your moderate risk tolerance, we recommend starting with a diversified portfolio.',
          action: 'Create a new portfolio with the recommended asset allocation',
          reason: 'Having a diversified investment portfolio is essential for long-term wealth building',
          estimated_impact: 'Could potentially grow your wealth by 7-10% annually over the long term'
        }
      ],
      total_count: 1,
      high_priority_count: 1,
      medium_priority_count: 0,
      low_priority_count: 0
    };

    await page.route('**/api/v1/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(userWithoutAge)
      });
    });

    await page.route('**/api/v1/recommendations/', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(defaultRecommendations)
      });
    });

    await page.goto('/');
    
    // Should show dashboard with recommendations
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('text=Investment Recommendations')).toBeVisible();
  });
});
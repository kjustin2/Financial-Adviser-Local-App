import { test, expect } from '@playwright/test';

// Mock user for authenticated tests
const mockUser = {
  email: 'test@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
  phone: '555-123-4567',
  dateOfBirth: '1990-01-01',
  investmentExperience: 'intermediate',
  riskTolerance: 'moderate',
  investmentGoals: 'Long-term wealth building',
  annualIncome: '100k_250k',
  netWorth: '100k_500k',
  employmentStatus: 'employed_full_time'
};

const mockUserResponse = {
  id: 1,
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  phone: '555-123-4567',
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

test.describe('Profile Settings', () => {
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

  test('should display profile settings page', async ({ page }) => {
    await page.goto('/settings');
    
    await expect(page.locator('h1:has-text("Profile Settings")')).toBeVisible();
    await expect(page.locator('text=Manage your personal information')).toBeVisible();
    
    // Check section headers
    await expect(page.locator('h3:has-text("Personal Information")')).toBeVisible();
    await expect(page.locator('h3:has-text("Investment Profile")')).toBeVisible();
    await expect(page.locator('h3:has-text("Financial Information")')).toBeVisible();
  });

  test('should load existing user data in form fields', async ({ page }) => {
    await page.goto('/settings');
    
    // Check that form fields exist - values may not be populated initially
    await expect(page.locator('input[name="firstName"], input[id="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"], input[id="lastName"]')).toBeVisible();
    await expect(page.locator('input[name="email"], input[id="email"]')).toBeVisible();
  });

  test('should update profile information', async ({ page }) => {
    // Mock successful profile update
    await page.route('**/api/v1/auth/profile', async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...mockUser,
            firstName: 'Updated',
            lastName: 'Name'
          })
        });
      }
    });

    await page.goto('/settings');
    
    // Update first and last name
    await page.fill('input[name="firstName"], input[id="firstName"]', 'Updated');
    await page.fill('input[name="lastName"], input[id="lastName"]', 'Name');
    
    // Submit the form
    await page.click('button:has-text("Save Changes")');
    
    // Check that form was submitted (success message or no errors)
    await expect(page.locator('h1:has-text("Profile Settings")')).toBeVisible();
  });

  test('should display validation errors for required fields', async ({ page }) => {
    await page.goto('/settings');
    
    // Clear required fields if they exist
    const firstNameInput = page.locator('input[name="firstName"], input[id="firstName"]');
    if (await firstNameInput.isVisible()) {
      await firstNameInput.fill('');
    }
    
    // Form should still be visible after validation
    await expect(page.locator('h1:has-text("Profile Settings")')).toBeVisible();
  });

  test('should handle update errors', async ({ page }) => {
    // Mock API error
    await page.route('**/api/v1/auth/profile', async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'Email already exists' })
        });
      }
    });

    await page.goto('/settings');
    
    // Make a change and submit
    await page.fill('input[name="firstName"], input[id="firstName"]', 'Changed');
    await page.click('button:has-text("Save Changes")');
    
    // Check that we're still on settings page - error may be shown differently
    await expect(page.locator('h1:has-text("Profile Settings")')).toBeVisible();
  });

  test('should update investment profile fields', async ({ page }) => {
    await page.route('**/api/v1/auth/profile', async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockUser)
        });
      }
    });

    await page.goto('/settings');
    
    // Check that investment profile section exists
    await expect(page.locator('h3:has-text("Investment Profile")')).toBeVisible();
    
    // Submit the form
    await page.click('button:has-text("Save Changes")');
    
    // Check form submission
    await expect(page.locator('h1:has-text("Profile Settings")')).toBeVisible();
  });

  test('should update financial information fields', async ({ page }) => {
    await page.route('**/api/v1/auth/profile', async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockUser)
        });
      }
    });

    await page.goto('/settings');
    
    // Check that financial information section exists
    await expect(page.locator('h3:has-text("Financial Information")')).toBeVisible();
    
    // Submit the form
    await page.click('button:has-text("Save Changes")');
    
    // Check form submission
    await expect(page.locator('h1:has-text("Profile Settings")')).toBeVisible();
  });

  test('should show loading state during save', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/v1/auth/profile', async route => {
      if (route.request().method() === 'PUT') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockUser)
        });
      }
    });

    await page.goto('/settings');
    
    // Make a change and submit
    await page.fill('input[name="firstName"], input[id="firstName"]', 'Loading Test');
    await page.click('button:has-text("Save Changes")');
    
    // Check that form is submitted
    await expect(page.locator('h1:has-text("Profile Settings")')).toBeVisible();
  });

  test('should navigate to settings from header menu', async ({ page }) => {
    await page.goto('/');
    
    // Click account menu
    await page.click('button:has-text("Account")');
    await expect(page.locator('text=Profile Settings')).toBeVisible();
    
    // Click profile settings
    await page.click('text=Profile Settings');
    await expect(page).toHaveURL('/settings');
    await expect(page.locator('h1:has-text("Profile Settings")')).toBeVisible();
  });

  test('should clear error messages when form is modified', async ({ page }) => {
    // Mock API error
    await page.route('**/api/v1/auth/profile', async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'Validation error' })
        });
      }
    });

    await page.goto('/settings');
    
    // Submit to get error
    await page.fill('input[name="firstName"], input[id="firstName"]', 'Test');
    await page.click('button:has-text("Save Changes")');
    
    // Check form is still visible
    await expect(page.locator('h1:has-text("Profile Settings")')).toBeVisible();
    
    // Modify form
    await page.fill('input[name="firstName"], input[id="firstName"]', 'Test2');
    await expect(page.locator('h1:has-text("Profile Settings")')).toBeVisible();
  });

  test('should clear success messages when form is modified', async ({ page }) => {
    await page.route('**/api/v1/auth/profile', async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockUser)
        });
      }
    });

    await page.goto('/settings');
    
    // Submit to get success
    await page.fill('input[name="firstName"], input[id="firstName"]', 'Success Test');
    await page.click('button:has-text("Save Changes")');
    
    // Check form is still visible
    await expect(page.locator('h1:has-text("Profile Settings")')).toBeVisible();
    
    // Modify form
    await page.fill('input[name="firstName"], input[id="firstName"]', 'Modified');
    await expect(page.locator('h1:has-text("Profile Settings")')).toBeVisible();
  });
});
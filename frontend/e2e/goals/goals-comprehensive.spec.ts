import { test, expect } from '@playwright/test';
import { AuthFixture, testUsers } from '../fixtures/auth';
import { ApiMocks } from '../fixtures/api-mocks';
import { testGoals } from '../fixtures/test-data';

test.describe('Comprehensive Goals Management Tests', () => {
  let authFixture: AuthFixture;
  let apiMocks: ApiMocks;

  test.beforeEach(async ({ page }) => {
    authFixture = new AuthFixture(page);
    apiMocks = new ApiMocks(page);
    
    await apiMocks.enableAllMocks();
    await authFixture.ensureLoggedIn();
  });

  test.describe('Goals Page Display', () => {
    test('should display empty goals state initially', async ({ page }) => {
      await page.goto('/goals');
      
      await expect(page.locator('h2:has-text("My Goals")')).toBeVisible();
      await expect(page.locator('[data-testid="empty-goals-state"]')).toBeVisible();
      await expect(page.locator('[data-testid="create-goal-btn"]')).toBeVisible();
      await expect(page.locator('text=Create your first financial goal')).toBeVisible();
    });

    test('should display goals page header correctly', async ({ page }) => {
      await page.goto('/goals');
      
      await expect(page).toHaveTitle(/Financial Adviser/);
      await expect(page.locator('h2:has-text("My Goals")')).toBeVisible();
      await expect(page.locator('text=Track your financial objectives')).toBeVisible();
      await expect(page.locator('[data-testid="create-goal-btn"]')).toBeVisible();
    });

    test('should show loading state while fetching goals', async ({ page }) => {
      await page.route('**/api/v1/goals**', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      });

      await page.goto('/goals');
      await expect(page.locator('[data-testid="loading-state"]')).toBeVisible();
    });

    test('should handle API errors gracefully', async ({ page }) => {
      await apiMocks.mockApiError('**/api/v1/goals**', 500);
      
      await page.goto('/goals');
      await expect(page.locator('[data-testid="error-state"]')).toBeVisible();
      await expect(page.locator('text=Try Again')).toBeVisible();
    });
  });

  test.describe('Goal Creation', () => {
    test('should open create goal modal', async ({ page }) => {
      await page.goto('/goals');
      await page.click('[data-testid="create-goal-btn"]');
      
      await expect(page.locator('[data-testid="create-goal-modal"]')).toBeVisible();
      await expect(page.locator('text=Create New Goal')).toBeVisible();
      await expect(page.locator('[data-testid="goal-name-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="goal-target-amount-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="goal-target-date-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="goal-category-select"]')).toBeVisible();
    });

    test('should validate required fields in goal creation', async ({ page }) => {
      await page.goto('/goals');
      await page.click('[data-testid="create-goal-btn"]');
      
      // Try to submit without required fields
      await page.click('[data-testid="create-goal-submit-btn"]');
      
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('text=Goal name is required')).toBeVisible();
    });

    test('should validate target amount is greater than 0', async ({ page }) => {
      await page.goto('/goals');
      await page.click('[data-testid="create-goal-btn"]');
      
      await page.fill('[data-testid="goal-name-input"]', testGoals.retirement.name);
      await page.fill('[data-testid="goal-target-amount-input"]', '0');
      await page.fill('[data-testid="goal-target-date-input"]', testGoals.retirement.targetDate);
      
      await page.click('[data-testid="create-goal-submit-btn"]');
      
      await expect(page.locator('text=Target amount must be greater than 0')).toBeVisible();
    });

    test('should create retirement goal successfully', async ({ page }) => {
      await page.goto('/goals');
      await page.click('[data-testid="create-goal-btn"]');
      
      // Fill in goal form
      await page.fill('[data-testid="goal-name-input"]', testGoals.retirement.name);
      await page.fill('[data-testid="goal-description-input"]', testGoals.retirement.description || '');
      await page.fill('[data-testid="goal-target-amount-input"]', testGoals.retirement.targetAmount.toString());
      await page.fill('[data-testid="goal-target-date-input"]', testGoals.retirement.targetDate);
      
      // Select category and priority
      await page.click('[data-testid="goal-category-select"]');
      await page.click('text=Retirement');
      
      await page.click('[data-testid="goal-priority-select"]');
      await page.click('text=High');
      
      await page.click('[data-testid="create-goal-submit-btn"]');
      
      // Modal should close and goal should appear in list
      await expect(page.locator('[data-testid="create-goal-modal"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="goals-list"]')).toBeVisible();
      await expect(page.locator(`text=${testGoals.retirement.name}`)).toBeVisible();
    });

    test('should create house down payment goal successfully', async ({ page }) => {
      await page.goto('/goals');
      await page.click('[data-testid="create-goal-btn"]');
      
      await page.fill('[data-testid="goal-name-input"]', testGoals.house.name);
      await page.fill('[data-testid="goal-description-input"]', testGoals.house.description || '');
      await page.fill('[data-testid="goal-target-amount-input"]', testGoals.house.targetAmount.toString());
      await page.fill('[data-testid="goal-target-date-input"]', testGoals.house.targetDate);
      
      await page.click('[data-testid="goal-category-select"]');
      await page.click('text=House');
      
      await page.click('[data-testid="create-goal-submit-btn"]');
      
      await expect(page.locator('[data-testid="create-goal-modal"]')).not.toBeVisible();
      await expect(page.locator(`text=${testGoals.house.name}`)).toBeVisible();
    });

    test('should create vacation goal successfully', async ({ page }) => {
      await page.goto('/goals');
      await page.click('[data-testid="create-goal-btn"]');
      
      await page.fill('[data-testid="goal-name-input"]', testGoals.vacation.name);
      await page.fill('[data-testid="goal-target-amount-input"]', testGoals.vacation.targetAmount.toString());
      await page.fill('[data-testid="goal-target-date-input"]', testGoals.vacation.targetDate);
      
      await page.click('[data-testid="goal-category-select"]');
      await page.click('text=Vacation');
      
      await page.click('[data-testid="create-goal-submit-btn"]');
      
      await expect(page.locator(`text=${testGoals.vacation.name}`)).toBeVisible();
    });

    test('should show loading state during goal creation', async ({ page }) => {
      await page.goto('/goals');
      await page.click('[data-testid="create-goal-btn"]');
      
      await page.fill('[data-testid="goal-name-input"]', testGoals.retirement.name);
      await page.fill('[data-testid="goal-target-amount-input"]', testGoals.retirement.targetAmount.toString());
      await page.fill('[data-testid="goal-target-date-input"]', testGoals.retirement.targetDate);
      
      await page.click('[data-testid="goal-category-select"]');
      await page.click('text=Retirement');
      
      await page.click('[data-testid="create-goal-submit-btn"]');
      
      await expect(page.locator('text=Creating...')).toBeVisible();
    });

    test('should handle goal creation errors', async ({ page }) => {
      await apiMocks.mockApiError('**/api/v1/goals', 400);
      
      await page.goto('/goals');
      await page.click('[data-testid="create-goal-btn"]');
      
      await page.fill('[data-testid="goal-name-input"]', testGoals.retirement.name);
      await page.fill('[data-testid="goal-target-amount-input"]', testGoals.retirement.targetAmount.toString());
      await page.fill('[data-testid="goal-target-date-input"]', testGoals.retirement.targetDate);
      
      await page.click('[data-testid="goal-category-select"]');
      await page.click('text=Retirement');
      
      await page.click('[data-testid="create-goal-submit-btn"]');
      
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    });

    test('should cancel goal creation', async ({ page }) => {
      await page.goto('/goals');
      await page.click('[data-testid="create-goal-btn"]');
      
      await page.click('[data-testid="cancel-goal-btn"]');
      
      await expect(page.locator('[data-testid="create-goal-modal"]')).not.toBeVisible();
    });
  });

  test.describe('Goals List Display', () => {
    test.beforeEach(async ({ page }) => {
      // Create test goals for list display tests
      await page.goto('/goals');
      
      // Create retirement goal
      await page.click('[data-testid="create-goal-btn"]');
      await page.fill('[data-testid="goal-name-input"]', testGoals.retirement.name);
      await page.fill('[data-testid="goal-target-amount-input"]', testGoals.retirement.targetAmount.toString());
      await page.fill('[data-testid="goal-target-date-input"]', testGoals.retirement.targetDate);
      await page.click('[data-testid="goal-category-select"]');
      await page.click('text=Retirement');
      await page.click('[data-testid="create-goal-submit-btn"]');
      
      // Wait for modal to close
      await expect(page.locator('[data-testid="create-goal-modal"]')).not.toBeVisible();
    });

    test('should display goals list with created goals', async ({ page }) => {
      await expect(page.locator('[data-testid="goals-list"]')).toBeVisible();
      await expect(page.locator('[data-testid="goal-card"]')).toBeVisible();
      await expect(page.locator(`text=${testGoals.retirement.name}`)).toBeVisible();
    });

    test('should display goal progress correctly', async ({ page }) => {
      const goalCard = page.locator('[data-testid="goal-card"]').first();
      
      // Should show progress bar
      await expect(goalCard.locator('.bg-blue-600')).toBeVisible(); // Progress bar
      await expect(goalCard.locator('text=0.0%')).toBeVisible(); // Initial progress
      
      // Should show current and target amounts
      await expect(goalCard.locator('text=Current')).toBeVisible();
      await expect(goalCard.locator('text=Target')).toBeVisible();
      await expect(goalCard.locator('text=$0.00')).toBeVisible(); // Current amount
      await expect(goalCard.locator(`text=$${testGoals.retirement.targetAmount.toLocaleString()}.00`)).toBeVisible();
    });

    test('should display goal categories with proper icons', async ({ page }) => {
      const goalCard = page.locator('[data-testid="goal-card"]').first();
      
      // Should show category-specific icon for retirement
      await expect(goalCard.locator('svg')).toBeVisible(); // Icon should be present
      await expect(goalCard.locator('text=high')).toBeVisible(); // Priority badge
    });

    test('should format currency amounts correctly', async ({ page }) => {
      const goalCard = page.locator('[data-testid="goal-card"]').first();
      
      // Check for proper currency formatting
      await expect(goalCard.locator('text=$1,000,000.00')).toBeVisible();
    });

    test('should format target dates correctly', async ({ page }) => {
      const goalCard = page.locator('[data-testid="goal-card"]').first();
      
      // Should show formatted date
      await expect(goalCard.locator('text=Target Date')).toBeVisible();
      await expect(goalCard.locator('text=January 1, 2055')).toBeVisible();
    });

    test('should display priority badges with correct colors', async ({ page }) => {
      const goalCard = page.locator('[data-testid="goal-card"]').first();
      const priorityBadge = goalCard.locator('.text-red-600'); // High priority should be red
      
      await expect(priorityBadge).toBeVisible();
      await expect(priorityBadge).toHaveText('high');
    });
  });

  test.describe('Goal Categories', () => {
    test('should create goals for all categories', async ({ page }) => {
      const categories = ['retirement', 'education', 'house', 'vacation', 'emergency', 'custom'];
      
      for (const category of categories) {
        await page.goto('/goals');
        await page.click('[data-testid="create-goal-btn"]');
        
        await page.fill('[data-testid="goal-name-input"]', `Test ${category} Goal`);
        await page.fill('[data-testid="goal-target-amount-input"]', '10000');
        await page.fill('[data-testid="goal-target-date-input"]', '2026-12-31');
        
        await page.click('[data-testid="goal-category-select"]');
        
        // Find and click the category option
        const categoryText = category.charAt(0).toUpperCase() + category.slice(1);
        await page.click(`text=${categoryText === 'Custom' ? 'Custom' : categoryText}`);
        
        await page.click('[data-testid="create-goal-submit-btn"]');
        
        await expect(page.locator('[data-testid="create-goal-modal"]')).not.toBeVisible();
        await expect(page.locator(`text=Test ${category} Goal`)).toBeVisible();
      }
    });
  });

  test.describe('Goal Priorities', () => {
    test('should create goals with different priorities', async ({ page }) => {
      const priorities = ['low', 'medium', 'high'];
      
      for (const priority of priorities) {
        await page.goto('/goals');
        await page.click('[data-testid="create-goal-btn"]');
        
        await page.fill('[data-testid="goal-name-input"]', `Test ${priority} Priority Goal`);
        await page.fill('[data-testid="goal-target-amount-input"]', '5000');
        await page.fill('[data-testid="goal-target-date-input"]', '2025-12-31');
        
        await page.click('[data-testid="goal-category-select"]');
        await page.click('text=Custom');
        
        await page.click('[data-testid="goal-priority-select"]');
        const priorityText = priority.charAt(0).toUpperCase() + priority.slice(1);
        await page.click(`text=${priorityText}`);
        
        await page.click('[data-testid="create-goal-submit-btn"]');
        
        await expect(page.locator(`text=Test ${priority} Priority Goal`)).toBeVisible();
      }
    });
  });

  test.describe('Form Validation', () => {
    test('should validate future target dates', async ({ page }) => {
      await page.goto('/goals');
      await page.click('[data-testid="create-goal-btn"]');
      
      await page.fill('[data-testid="goal-name-input"]', 'Test Goal');
      await page.fill('[data-testid="goal-target-amount-input"]', '10000');
      await page.fill('[data-testid="goal-target-date-input"]', '2020-01-01'); // Past date
      
      await page.click('[data-testid="goal-category-select"]');
      await page.click('text=Custom');
      
      await page.click('[data-testid="create-goal-submit-btn"]');
      
      // Should prevent past dates (browser validation)
      await expect(page.locator('[data-testid="goal-target-date-input"]')).toBeFocused();
    });

    test('should validate goal name length', async ({ page }) => {
      await page.goto('/goals');
      await page.click('[data-testid="create-goal-btn"]');
      
      // Try very long name
      await page.fill('[data-testid="goal-name-input"]', 'A'.repeat(300));
      await page.fill('[data-testid="goal-target-amount-input"]', '10000');
      await page.fill('[data-testid="goal-target-date-input"]', '2026-01-01');
      
      await page.click('[data-testid="create-goal-submit-btn"]');
      
      // Form should handle long names gracefully
      await expect(page.locator('[data-testid="goal-name-input"]')).toHaveValue('A'.repeat(300));
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/goals');
      
      await expect(page.locator('h2:has-text("My Goals")')).toBeVisible();
      await expect(page.locator('[data-testid="create-goal-btn"]')).toBeVisible();
    });

    test('should display correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/goals');
      
      await expect(page.locator('h2:has-text("My Goals")')).toBeVisible();
      await expect(page.locator('[data-testid="create-goal-btn"]')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper form labels', async ({ page }) => {
      await page.goto('/goals');
      await page.click('[data-testid="create-goal-btn"]');
      
      await expect(page.locator('label[for="name"]')).toBeVisible();
      await expect(page.locator('label[for="target_amount"]')).toBeVisible();
      await expect(page.locator('label[for="target_date"]')).toBeVisible();
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/goals');
      await page.click('[data-testid="create-goal-btn"]');
      
      // Tab through form elements
      await page.press('body', 'Tab');
      await expect(page.locator('[data-testid="goal-name-input"]')).toBeFocused();
      
      await page.press('[data-testid="goal-name-input"]', 'Tab');
      await expect(page.locator('[data-testid="goal-description-input"]')).toBeFocused();
    });
  });
});
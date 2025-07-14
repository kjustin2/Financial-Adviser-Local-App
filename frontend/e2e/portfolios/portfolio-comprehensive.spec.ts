import { test, expect } from '@playwright/test';
import { AuthFixture, testUsers } from '../fixtures/auth';
import { ApiMocks } from '../fixtures/api-mocks';
import { PortfolioPage } from '../page-objects/PortfolioPage';
import { testPortfolios } from '../fixtures/test-data';

test.describe('Comprehensive Portfolio Management Tests', () => {
  let authFixture: AuthFixture;
  let apiMocks: ApiMocks;
  let portfolioPage: PortfolioPage;

  test.beforeEach(async ({ page }) => {
    authFixture = new AuthFixture(page);
    apiMocks = new ApiMocks(page);
    portfolioPage = new PortfolioPage(page);
    
    await apiMocks.enableAllMocks();
    await authFixture.ensureLoggedIn();
  });

  test.describe('Portfolio List Display', () => {
    test('should display empty portfolio state initially', async ({ page }) => {
      await portfolioPage.navigate();
      await portfolioPage.waitForPageLoad();
      
      await expect(page.locator('h2:has-text("Portfolios")')).toBeVisible();
      await portfolioPage.verifyEmptyState();
      await expect(portfolioPage.createPortfolioButton).toBeVisible();
    });

    test('should display portfolios after creation', async ({ page }) => {
      await portfolioPage.navigate();
      
      // Create a portfolio
      await portfolioPage.createPortfolio(testPortfolios.retirement);
      
      // Verify it appears in the list
      await portfolioPage.verifyPortfolioExists(testPortfolios.retirement.name);
      await expect(await portfolioPage.getPortfolioCount()).toBe(1);
    });

    test('should show loading state while fetching portfolios', async ({ page }) => {
      // Mock slow API response
      await page.route('**/api/v1/portfolios**', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      });

      await portfolioPage.navigate();
      await portfolioPage.verifyLoadingState();
    });

    test('should handle API errors gracefully', async ({ page }) => {
      await apiMocks.mockApiError('**/api/v1/portfolios**', 500);
      
      await portfolioPage.navigate();
      await expect(page.locator('[data-testid="error-state"]')).toBeVisible();
      await expect(page.locator('text=Try Again')).toBeVisible();
    });
  });

  test.describe('Portfolio Creation', () => {
    test('should open create portfolio modal', async ({ page }) => {
      await portfolioPage.navigate();
      await portfolioPage.clickCreatePortfolio();
      
      await expect(portfolioPage.modal).toBeVisible();
      await expect(portfolioPage.modalTitle).toHaveText('Create New Portfolio');
      await expect(portfolioPage.nameInput).toBeVisible();
      await expect(portfolioPage.typeSelect).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      await portfolioPage.navigate();
      await portfolioPage.clickCreatePortfolio();
      await portfolioPage.verifyFormValidation();
    });

    test('should create retirement portfolio successfully', async ({ page }) => {
      await portfolioPage.navigate();
      await portfolioPage.createPortfolio(testPortfolios.retirement);
      
      // Verify portfolio appears in list
      await portfolioPage.verifyPortfolioExists(testPortfolios.retirement.name);
      await portfolioPage.verifyPortfolioDetails(testPortfolios.retirement.name, testPortfolios.retirement);
    });

    test('should create taxable portfolio successfully', async ({ page }) => {
      await portfolioPage.navigate();
      await portfolioPage.createPortfolio(testPortfolios.taxable);
      
      await portfolioPage.verifyPortfolioExists(testPortfolios.taxable.name);
    });

    test('should create education portfolio successfully', async ({ page }) => {
      await portfolioPage.navigate();
      await portfolioPage.createPortfolio(testPortfolios.education);
      
      await portfolioPage.verifyPortfolioExists(testPortfolios.education.name);
    });

    test('should show loading state during creation', async ({ page }) => {
      await portfolioPage.navigate();
      await portfolioPage.clickCreatePortfolio();
      await portfolioPage.fillPortfolioForm(testPortfolios.retirement);
      
      await portfolioPage.submitButton.click();
      await expect(portfolioPage.submitButton).toHaveText('Creating...');
    });

    test('should handle creation errors', async ({ page }) => {
      await apiMocks.mockApiError('**/api/v1/portfolios', 400);
      
      await portfolioPage.navigate();
      await portfolioPage.clickCreatePortfolio();
      await portfolioPage.fillPortfolioForm(testPortfolios.retirement);
      await portfolioPage.submitButton.click();
      
      // Should show error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    });

    test('should cancel portfolio creation', async ({ page }) => {
      await portfolioPage.navigate();
      await portfolioPage.clickCreatePortfolio();
      await portfolioPage.cancelPortfolioCreation();
      
      await expect(portfolioPage.modal).not.toBeVisible();
    });

    test('should close modal with X button', async ({ page }) => {
      await portfolioPage.navigate();
      await portfolioPage.clickCreatePortfolio();
      await portfolioPage.closeModal();
      
      await expect(portfolioPage.modal).not.toBeVisible();
    });
  });

  test.describe('Portfolio Management', () => {
    test.beforeEach(async ({ page }) => {
      // Create a test portfolio for management tests
      await portfolioPage.navigate();
      await portfolioPage.createPortfolio(testPortfolios.retirement);
    });

    test('should edit portfolio successfully', async ({ page }) => {
      const updatedData = {
        name: 'Updated Retirement Portfolio',
        description: 'Updated description',
        type: 'retirement' as const
      };

      await portfolioPage.editPortfolio(testPortfolios.retirement.name, updatedData);
      await portfolioPage.verifyPortfolioExists(updatedData.name);
    });

    test('should delete portfolio with confirmation', async ({ page }) => {
      await portfolioPage.deletePortfolio(testPortfolios.retirement.name);
      
      // Should return to empty state
      await portfolioPage.verifyEmptyState();
    });

    test('should view portfolio details', async ({ page }) => {
      await portfolioPage.clickPortfolio(testPortfolios.retirement.name);
      
      // Should navigate to portfolio detail page
      await expect(page).toHaveURL(/.*\/portfolios\/\d+/);
    });
  });

  test.describe('Portfolio Filtering and Sorting', () => {
    test.beforeEach(async ({ page }) => {
      // Create multiple portfolios for filtering tests
      await portfolioPage.navigate();
      await portfolioPage.createPortfolio(testPortfolios.retirement);
      await portfolioPage.createPortfolio(testPortfolios.taxable);
      await portfolioPage.createPortfolio(testPortfolios.education);
    });

    test('should filter portfolios by type', async ({ page }) => {
      await portfolioPage.filterPortfolios('retirement');
      
      await portfolioPage.verifyPortfolioExists(testPortfolios.retirement.name);
      await expect(page.locator(`text=${testPortfolios.taxable.name}`)).not.toBeVisible();
    });

    test('should sort portfolios by name', async ({ page }) => {
      await portfolioPage.sortPortfolios('name');
      
      // Verify sorted order
      const portfolioCards = page.locator('[data-testid="portfolio-card"]');
      await expect(portfolioCards.first()).toContainText('Education');
    });

    test('should search portfolios', async ({ page }) => {
      await portfolioPage.searchPortfolios('Retirement');
      
      await portfolioPage.verifyPortfolioExists(testPortfolios.retirement.name);
      await expect(page.locator(`text=${testPortfolios.education.name}`)).not.toBeVisible();
    });

    test('should show all portfolios when filter cleared', async ({ page }) => {
      await portfolioPage.filterPortfolios('retirement');
      await portfolioPage.filterPortfolios('all');
      
      await portfolioPage.verifyPortfolioExists(testPortfolios.retirement.name);
      await portfolioPage.verifyPortfolioExists(testPortfolios.taxable.name);
      await portfolioPage.verifyPortfolioExists(testPortfolios.education.name);
    });
  });

  test.describe('Portfolio Data Validation', () => {
    test('should prevent duplicate portfolio names', async ({ page }) => {
      await portfolioPage.navigate();
      await portfolioPage.createPortfolio(testPortfolios.retirement);
      
      // Try to create another portfolio with same name
      await portfolioPage.clickCreatePortfolio();
      await portfolioPage.fillPortfolioForm(testPortfolios.retirement);
      await portfolioPage.submitButton.click();
      
      // Should show validation error
      await portfolioPage.verifyValidationError('name', 'Portfolio name already exists');
    });

    test('should validate portfolio name length', async ({ page }) => {
      const longNamePortfolio = {
        ...testPortfolios.retirement,
        name: 'A'.repeat(256) // Exceeds max length
      };

      await portfolioPage.navigate();
      await portfolioPage.clickCreatePortfolio();
      await portfolioPage.fillPortfolioForm(longNamePortfolio);
      await portfolioPage.submitButton.click();
      
      await portfolioPage.verifyValidationError('name', 'Name is too long');
    });

    test('should validate required fields on edit', async ({ page }) => {
      await portfolioPage.navigate();
      await portfolioPage.createPortfolio(testPortfolios.retirement);
      
      const portfolio = await portfolioPage.getPortfolioByName(testPortfolios.retirement.name);
      await portfolio.locator('[data-testid="edit-portfolio"]').click();
      
      // Clear required field
      await portfolioPage.nameInput.clear();
      await portfolioPage.submitButton.click();
      
      await portfolioPage.verifyValidationError('name', 'Name is required');
    });
  });

  test.describe('Portfolio Performance Display', () => {
    test('should display portfolio metrics correctly', async ({ page }) => {
      await portfolioPage.navigate();
      await portfolioPage.createPortfolio(testPortfolios.retirement);
      
      const portfolio = await portfolioPage.getPortfolioByName(testPortfolios.retirement.name);
      
      // Should show value, return, and other metrics
      await expect(portfolio.locator('[data-testid="portfolio-value"]')).toBeVisible();
      await expect(portfolio.locator('[data-testid="portfolio-return"]')).toBeVisible();
      await expect(portfolio.locator('[data-testid="holdings-count"]')).toBeVisible();
    });

    test('should format currency values correctly', async ({ page }) => {
      await portfolioPage.navigate();
      await portfolioPage.createPortfolio(testPortfolios.retirement);
      
      const portfolio = await portfolioPage.getPortfolioByName(testPortfolios.retirement.name);
      const valueElement = portfolio.locator('[data-testid="portfolio-value"]');
      
      // Should show $0.00 for new portfolio
      await expect(valueElement).toContainText('$0.00');
    });

    test('should display return percentages with proper formatting', async ({ page }) => {
      await portfolioPage.navigate();
      await portfolioPage.createPortfolio(testPortfolios.retirement);
      
      const portfolio = await portfolioPage.getPortfolioByName(testPortfolios.retirement.name);
      const returnElement = portfolio.locator('[data-testid="portfolio-return"]');
      
      // Should show 0.00% for new portfolio
      await expect(returnElement).toContainText('0.00%');
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await portfolioPage.navigate();
      await portfolioPage.createPortfolio(testPortfolios.retirement);
      
      // Should adapt layout for mobile
      await expect(page.locator('[data-testid="portfolio-list"]')).toBeVisible();
      await expect(portfolioPage.createPortfolioButton).toBeVisible();
    });

    test('should display correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await portfolioPage.navigate();
      await portfolioPage.createPortfolio(testPortfolios.retirement);
      
      await expect(page.locator('[data-testid="portfolio-list"]')).toBeVisible();
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should support keyboard navigation in modal', async ({ page }) => {
      await portfolioPage.navigate();
      await portfolioPage.clickCreatePortfolio();
      
      // Tab through form elements
      await page.press('body', 'Tab');
      await expect(portfolioPage.nameInput).toBeFocused();
      
      await page.press('input[name="name"]', 'Tab');
      await expect(portfolioPage.descriptionInput).toBeFocused();
    });

    test('should close modal with Escape key', async ({ page }) => {
      await portfolioPage.navigate();
      await portfolioPage.clickCreatePortfolio();
      
      await page.press('body', 'Escape');
      await expect(portfolioPage.modal).not.toBeVisible();
    });
  });
});
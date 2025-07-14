import { Page, expect, Locator } from '@playwright/test';
import { PortfolioData } from '../fixtures/test-data';

export class PortfolioPage {
  readonly page: Page;
  readonly createPortfolioButton: Locator;
  readonly portfolioList: Locator;
  readonly emptyState: Locator;
  readonly loadingState: Locator;

  // Modal elements
  readonly modal: Locator;
  readonly modalTitle: Locator;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly typeSelect: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createPortfolioButton = page.locator('[data-testid="create-portfolio-btn"]');
    this.portfolioList = page.locator('[data-testid="portfolio-list"]');
    this.emptyState = page.locator('[data-testid="empty-portfolio-state"]');
    this.loadingState = page.locator('[data-testid="loading-state"]');

    // Modal elements
    this.modal = page.locator('[data-testid="create-portfolio-modal"]');
    this.modalTitle = this.modal.locator('h2');
    this.nameInput = this.modal.locator('input[name="name"]');
    this.descriptionInput = this.modal.locator('textarea[name="description"]');
    this.typeSelect = this.modal.locator('select[name="portfolio_type"]');
    this.submitButton = this.modal.locator('button[type="submit"]');
    this.cancelButton = this.modal.locator('button:has-text("Cancel")');
    this.closeButton = this.modal.locator('[data-testid="close-modal"]');
  }

  async navigate() {
    await this.page.goto('/portfolios');
    await expect(this.page).toHaveURL('/portfolios');
  }

  async waitForPageLoad() {
    await expect(this.page.locator('h2:has-text("Portfolios")')).toBeVisible();
  }

  async clickCreatePortfolio() {
    await this.createPortfolioButton.click();
    await expect(this.modal).toBeVisible();
    await expect(this.modalTitle).toHaveText('Create New Portfolio');
  }

  async fillPortfolioForm(data: PortfolioData) {
    await expect(this.nameInput).toBeVisible();
    await this.nameInput.fill(data.name);
    
    if (data.description) {
      await this.descriptionInput.fill(data.description);
    }
    
    await this.typeSelect.selectOption(data.type);
  }

  async submitPortfolioForm() {
    await this.submitButton.click();
  }

  async createPortfolio(data: PortfolioData) {
    await this.clickCreatePortfolio();
    await this.fillPortfolioForm(data);
    await this.submitPortfolioForm();
    
    // Wait for modal to close
    await expect(this.modal).not.toBeVisible();
  }

  async cancelPortfolioCreation() {
    await this.cancelButton.click();
    await expect(this.modal).not.toBeVisible();
  }

  async closeModal() {
    await this.closeButton.click();
    await expect(this.modal).not.toBeVisible();
  }

  async verifyPortfolioExists(name: string) {
    await expect(this.portfolioList.locator(`text=${name}`)).toBeVisible();
  }

  async verifyEmptyState() {
    await expect(this.emptyState).toBeVisible();
    await expect(this.emptyState).toContainText('No portfolios found');
  }

  async verifyLoadingState() {
    await expect(this.loadingState).toBeVisible();
  }

  async getPortfolioCount() {
    const portfolioCards = this.portfolioList.locator('[data-testid="portfolio-card"]');
    return await portfolioCards.count();
  }

  async getPortfolioByName(name: string) {
    return this.portfolioList.locator(`[data-testid="portfolio-card"]:has-text("${name}")`);
  }

  async clickPortfolio(name: string) {
    const portfolio = await this.getPortfolioByName(name);
    await portfolio.click();
  }

  async deletePortfolio(name: string) {
    const portfolio = await this.getPortfolioByName(name);
    await portfolio.locator('[data-testid="delete-portfolio"]').click();
    
    // Confirm deletion
    await this.page.locator('button:has-text("Delete")').click();
  }

  async editPortfolio(name: string, newData: Partial<PortfolioData>) {
    const portfolio = await this.getPortfolioByName(name);
    await portfolio.locator('[data-testid="edit-portfolio"]').click();
    
    await expect(this.modal).toBeVisible();
    
    if (newData.name) {
      await this.nameInput.clear();
      await this.nameInput.fill(newData.name);
    }
    
    if (newData.description) {
      await this.descriptionInput.clear();
      await this.descriptionInput.fill(newData.description);
    }
    
    if (newData.type) {
      await this.typeSelect.selectOption(newData.type);
    }
    
    await this.submitPortfolioForm();
    await expect(this.modal).not.toBeVisible();
  }

  async verifyValidationError(field: string, message: string) {
    const errorElement = this.modal.locator(`[data-testid="${field}-error"]`);
    await expect(errorElement).toBeVisible();
    await expect(errorElement).toContainText(message);
  }

  async verifyFormValidation() {
    // Try to submit empty form
    await this.submitButton.click();
    
    // Should show validation errors
    await this.verifyValidationError('name', 'Name is required');
  }

  async sortPortfolios(sortBy: 'name' | 'value' | 'return' | 'date') {
    await this.page.locator(`[data-testid="sort-${sortBy}"]`).click();
  }

  async filterPortfolios(filterBy: 'all' | 'taxable' | 'retirement' | 'education') {
    await this.page.locator(`[data-testid="filter-${filterBy}"]`).click();
  }

  async searchPortfolios(query: string) {
    const searchInput = this.page.locator('[data-testid="portfolio-search"]');
    await searchInput.fill(query);
  }

  async verifyPortfolioDetails(name: string, expectedData: Partial<PortfolioData>) {
    const portfolio = await this.getPortfolioByName(name);
    
    if (expectedData.description) {
      await expect(portfolio).toContainText(expectedData.description);
    }
    
    if (expectedData.type) {
      await expect(portfolio).toContainText(expectedData.type);
    }
  }
}
import { Page, expect } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
}

export const testUsers = {
  standard: {
    email: 'test@example.com',
    password: 'Test123!@#',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
    dateOfBirth: '1990-01-01'
  },
  premium: {
    email: 'premium@example.com',
    password: 'Premium123!@#',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '+1234567891',
    dateOfBirth: '1985-05-15'
  },
  investor: {
    email: 'investor@example.com',
    password: 'Investor123!@#',
    firstName: 'Bob',
    lastName: 'Johnson',
    phone: '+1234567892',
    dateOfBirth: '1980-12-01'
  }
};

export class AuthFixture {
  constructor(private page: Page) {}

  async loginUser(user: TestUser) {
    await this.page.goto('/login');
    await this.page.fill('input[type="email"]', user.email);
    await this.page.fill('input[type="password"]', user.password);
    await this.page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard with more flexible timeout
    await this.page.waitForURL('/', { timeout: 15000 });
    await expect(this.page.locator('h2:has-text("Dashboard")')).toBeVisible({ timeout: 15000 });
  }

  async registerUser(user: TestUser) {
    await this.page.goto('/register');
    await this.page.fill('input[name="firstName"]', user.firstName);
    await this.page.fill('input[name="lastName"]', user.lastName);
    await this.page.fill('input[type="email"]', user.email);
    if (user.phone) {
      await this.page.fill('input[name="phone"]', user.phone);
    }
    if (user.dateOfBirth) {
      await this.page.fill('input[name="dateOfBirth"]', user.dateOfBirth);
    }
    await this.page.fill('input[name="password"]', user.password);
    await this.page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard after registration
    await this.page.waitForURL('/', { timeout: 15000 });
  }

  async logout() {
    // Click user menu
    await this.page.click('[data-testid="user-menu-trigger"]');
    await this.page.click('text=Logout');
    
    // Should redirect to login
    await expect(this.page).toHaveURL(/.*\/login/);
  }

  async ensureLoggedOut() {
    await this.page.goto('/');
    // Should be redirected to login if not authenticated
    await expect(this.page).toHaveURL(/.*\/login/);
  }

  async ensureLoggedIn(user: TestUser = testUsers.standard) {
    // Try to go to dashboard first
    await this.page.goto('/');
    
    // Check if we're redirected to login (not authenticated)
    await this.page.waitForLoadState('domcontentloaded');
    const currentUrl = this.page.url();
    
    if (currentUrl.includes('/login')) {
      // Need to login
      await this.loginUser(user);
    } else {
      // Already logged in, verify dashboard is visible
      await expect(this.page.locator('h2:has-text("Dashboard")')).toBeVisible({ timeout: 10000 });
    }
  }
}
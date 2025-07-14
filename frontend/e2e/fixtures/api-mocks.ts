import { Page, Route } from '@playwright/test';
import { testPortfolios, testGoals, testTransactions } from './test-data';

export class ApiMocks {
  constructor(private page: Page) {}

  async mockAuthEndpoints() {
    // Mock successful login using the working pattern from dashboard tests
    await this.page.route('**/api/v1/auth/login/json', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-jwt-token-12345',
          token_type: 'bearer',
          expires_in: 3600,
          user: {
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
          }
        })
      });
    });

    // Mock successful registration
    await this.page.route('**/api/v1/auth/register', async (route: Route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-jwt-token',
          token_type: 'bearer',
          user: {
            id: 2,
            email: 'newuser@example.com',
            first_name: 'New',
            last_name: 'User'
          }
        })
      });
    });

    // Mock user profile endpoint
    await this.page.route('**/api/v1/auth/me', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
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
        })
      });
    });
  }

  async mockPortfolioEndpoints() {
    // Mock portfolio list - initially empty, then with data
    let portfolios: any[] = [];

    await this.page.route('**/api/v1/portfolios**', async (route: Route) => {
      const method = route.request().method();
      
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(portfolios)
        });
      } else if (method === 'POST') {
        const postData = route.request().postDataJSON();
        const newPortfolio = {
          id: portfolios.length + 1,
          user_id: 1,
          name: postData.name,
          description: postData.description || '',
          portfolio_type: postData.portfolio_type || 'taxable',
          total_value: 0,
          total_cost_basis: 0,
          unrealized_gain_loss: 0,
          unrealized_return_percent: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
          holdings: []
        };
        portfolios.push(newPortfolio);
        
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(newPortfolio)
        });
      }
    });

    // Mock individual portfolio endpoint
    await this.page.route('**/api/v1/portfolios/*', async (route: Route) => {
      const method = route.request().method();
      const url = route.request().url();
      const portfolioId = parseInt(url.split('/').pop() || '0');
      
      if (method === 'GET') {
        const portfolio = portfolios.find(p => p.id === portfolioId);
        if (portfolio) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(portfolio)
          });
        } else {
          await route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ detail: 'Portfolio not found' })
          });
        }
      } else if (method === 'PUT') {
        const postData = route.request().postDataJSON();
        const portfolioIndex = portfolios.findIndex(p => p.id === portfolioId);
        if (portfolioIndex >= 0) {
          portfolios[portfolioIndex] = { ...portfolios[portfolioIndex], ...postData };
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(portfolios[portfolioIndex])
          });
        } else {
          await route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ detail: 'Portfolio not found' })
          });
        }
      } else if (method === 'DELETE') {
        const portfolioIndex = portfolios.findIndex(p => p.id === portfolioId);
        if (portfolioIndex >= 0) {
          portfolios.splice(portfolioIndex, 1);
          await route.fulfill({ status: 204 });
        } else {
          await route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ detail: 'Portfolio not found' })
          });
        }
      }
    });
  }

  async mockGoalsEndpoints() {
    let goals: any[] = [];

    await this.page.route('**/api/v1/goals/', async (route: Route) => {
      const method = route.request().method();
      
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            goals: goals,
            total_count: goals.length,
            total_target_amount: goals.reduce((sum, g) => sum + g.target_amount, 0),
            total_current_amount: goals.reduce((sum, g) => sum + g.current_amount, 0),
            average_progress: goals.length > 0 ? goals.reduce((sum, g) => sum + g.progress_percentage, 0) / goals.length : 0,
            goals_on_track: goals.filter(g => g.progress_percentage >= 25).length,
            goals_behind: goals.filter(g => g.progress_percentage < 25).length
          })
        });
      } else if (method === 'POST') {
        const postData = route.request().postDataJSON();
        const newGoal = {
          id: goals.length + 1,
          user_id: 1,
          name: postData.name,
          description: postData.description || '',
          target_amount: postData.target_amount,
          target_date: postData.target_date,
          category: postData.category,
          priority: postData.priority || 'medium',
          current_amount: 0,
          progress_percentage: 0,
          remaining_amount: postData.target_amount,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true
        };
        goals.push(newGoal);
        
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(newGoal)
        });
      }
    });
  }


  async mockTransactionEndpoints() {
    let transactions: any[] = [];

    await this.page.route('**/api/v1/transactions**', async (route: Route) => {
      const method = route.request().method();
      
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(transactions)
        });
      } else if (method === 'POST') {
        const postData = route.request().postDataJSON();
        const newTransaction = {
          id: transactions.length + 1,
          user_id: 1,
          portfolio_id: postData.portfolio_id,
          type: postData.type,
          symbol: postData.symbol,
          quantity: postData.quantity,
          price: postData.price,
          date: postData.date,
          fees: postData.fees || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        transactions.push(newTransaction);
        
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(newTransaction)
        });
      }
    });
  }

  async mockRecommendationsEndpoints() {
    await this.page.route('**/api/v1/recommendations**', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            type: 'rebalance',
            priority: 'high',
            title: 'Rebalance Portfolio',
            description: 'Your portfolio has drifted from target allocation',
            expected_impact: 'Reduce risk by 15%',
            action_items: ['Sell TECH positions', 'Buy BONDS'],
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            type: 'tax_optimization',
            priority: 'medium',
            title: 'Tax Loss Harvesting',
            description: 'Harvest losses to reduce tax liability',
            expected_impact: 'Save $2,500 in taxes',
            action_items: ['Sell STOCK A at loss', 'Buy similar asset'],
            created_at: new Date().toISOString()
          }
        ])
      });
    });
  }


  async enableAllMocks() {
    await this.mockAuthEndpoints();
    await this.mockPortfolioEndpoints();
    await this.mockGoalsEndpoints();
    await this.mockTransactionEndpoints();
    await this.mockRecommendationsEndpoints();
  }

  async mockApiError(endpoint: string, statusCode: number = 500) {
    await this.page.route(endpoint, async (route: Route) => {
      await route.fulfill({
        status: statusCode,
        contentType: 'application/json',
        body: JSON.stringify({
          detail: 'Internal server error'
        })
      });
    });
  }

  async mockApiTimeout(endpoint: string) {
    await this.page.route(endpoint, async (route: Route) => {
      // Simulate timeout by delaying response beyond test timeout
      await new Promise(resolve => setTimeout(resolve, 35000));
      await route.fulfill({
        status: 408,
        contentType: 'application/json',
        body: JSON.stringify({
          detail: 'Request timeout'
        })
      });
    });
  }
}
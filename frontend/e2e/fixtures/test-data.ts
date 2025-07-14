export interface PortfolioData {
  name: string;
  description?: string;
  type: 'investment' | 'retirement' | 'education' | 'taxable' | 'tax_deferred';
  initialValue?: number;
}

export interface GoalData {
  name: string;
  description?: string;
  targetAmount: number;
  targetDate: string;
  category: 'retirement' | 'education' | 'house' | 'vacation' | 'emergency' | 'custom';
  priority: 'low' | 'medium' | 'high';
}

export interface TransactionData {
  type: 'buy' | 'sell' | 'dividend';
  symbol: string;
  quantity: number;
  price: number;
  date: string;
  portfolioName?: string;
}

export const testPortfolios: Record<string, PortfolioData> = {
  retirement: {
    name: 'Retirement Portfolio',
    description: 'Long-term retirement savings',
    type: 'retirement',
    initialValue: 50000
  },
  taxable: {
    name: 'Taxable Investment Account',
    description: 'General investment portfolio',
    type: 'taxable',
    initialValue: 25000
  },
  education: {
    name: 'Education Savings',
    description: 'College fund for children',
    type: 'education',
    initialValue: 15000
  }
};

export const testGoals: Record<string, GoalData> = {
  retirement: {
    name: 'Retirement Goal',
    description: 'Retire comfortably by age 65',
    targetAmount: 1000000,
    targetDate: '2055-01-01',
    category: 'retirement',
    priority: 'high'
  },
  house: {
    name: 'House Down Payment',
    description: 'Save for house down payment',
    targetAmount: 100000,
    targetDate: '2027-06-01',
    category: 'house',
    priority: 'high'
  },
  vacation: {
    name: 'Dream Vacation',
    description: 'Trip to Europe',
    targetAmount: 15000,
    targetDate: '2025-12-01',
    category: 'vacation',
    priority: 'medium'
  }
};

export const testTransactions: Record<string, TransactionData> = {
  buyStock: {
    type: 'buy',
    symbol: 'AAPL',
    quantity: 10,
    price: 150.00,
    date: '2024-01-15'
  },
  sellStock: {
    type: 'sell',
    symbol: 'AAPL',
    quantity: 5,
    price: 160.00,
    date: '2024-02-15'
  },
  dividend: {
    type: 'dividend',
    symbol: 'MSFT',
    quantity: 20,
    price: 0.75,
    date: '2024-03-01'
  }
};


export const userProfiles = {
  conservative: {
    riskTolerance: 'conservative',
    investmentExperience: 'beginner',
    investmentHorizon: 'long_term',
    financialGoals: ['retirement', 'stability']
  },
  moderate: {
    riskTolerance: 'moderate',
    investmentExperience: 'intermediate',
    investmentHorizon: 'medium_term',
    financialGoals: ['growth', 'retirement']
  },
  aggressive: {
    riskTolerance: 'aggressive',
    investmentExperience: 'advanced',
    investmentHorizon: 'long_term',
    financialGoals: ['growth', 'wealth_building']
  }
};
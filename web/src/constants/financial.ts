// Financial calculation constants

export const FINANCIAL_CONSTANTS = {
  // Emergency fund targets
  EMERGENCY_FUND_MONTHS: 3,
  IDEAL_EMERGENCY_FUND_MONTHS: 6,
  
  // Savings rate thresholds
  EXCELLENT_SAVINGS_RATE: 0.2,
  GOOD_SAVINGS_RATE: 0.15,
  FAIR_SAVINGS_RATE: 0.1,
  MINIMUM_SAVINGS_RATE: 0.05,
  
  // Debt-to-income ratio thresholds
  LOW_DEBT_RATIO: 0.1,
  MODERATE_DEBT_RATIO: 0.2,
  HIGH_DEBT_RATIO: 0.3,
  CRITICAL_DEBT_RATIO: 0.4,
  
  // Expense ratio thresholds
  EXCELLENT_EXPENSE_RATIO: 0.5,
  GOOD_EXPENSE_RATIO: 0.7,
  FAIR_EXPENSE_RATIO: 0.8,
  HIGH_EXPENSE_RATIO: 0.9,
  
  // Age thresholds for risk recommendations
  YOUNG_INVESTOR_AGE: 35,
  MATURE_INVESTOR_AGE: 55,
  
  // Financial health score weights
  SAVINGS_RATE_WEIGHT: 30,
  EXPENSE_RATIO_WEIGHT: 25,
  DEBT_RATIO_WEIGHT: 25,
  EMERGENCY_FUND_WEIGHT: 20,
  
  // Goal progress threshold
  GOAL_PROGRESS_THRESHOLD: 0.8,
  
  // Maximum recommendations to show
  MAX_RECOMMENDATIONS: 5
} as const

export const GOAL_TYPES = {
  EMERGENCY: 'emergency',
  RETIREMENT: 'retirement',
  PURCHASE: 'purchase'
} as const

export const RISK_TOLERANCE_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const

export const RECOMMENDATION_PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
} as const
// Simplified type definitions for MVP

export interface SimpleUserProfile {
  id: string
  name: string
  age: number
  monthlyIncome: number
  monthlySavings: number
  monthlyExpenses: number
  currentDebt: number
  emergencyFund: number
  riskTolerance: 'low' | 'medium' | 'high'
  createdAt: Date
  updatedAt: Date
}

export interface CreateProfileData {
  name: string
  age: number
  monthlyIncome: number
  monthlySavings: number
  monthlyExpenses: number
  currentDebt?: number
  emergencyFund?: number
  riskTolerance: 'low' | 'medium' | 'high'
}

export interface SimpleGoal {
  id: string
  userId: string
  type: 'emergency' | 'retirement' | 'purchase'
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: Date
  monthlyContribution: number
  createdAt: Date
}

export interface CreateGoalData {
  type: 'emergency' | 'retirement' | 'purchase'
  name: string
  targetAmount: number
  currentAmount?: number
  targetDate: Date
  monthlyContribution: number
}

export interface SimpleRecommendation {
  id: string
  userId: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: 'savings' | 'debt' | 'goals' | 'risk'
  actionText: string
  createdAt: Date
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export interface FinancialMetrics {
  savingsRate: number
  debtToIncomeRatio: number
  emergencyFundMonths: number
  expenseRatio: number
}
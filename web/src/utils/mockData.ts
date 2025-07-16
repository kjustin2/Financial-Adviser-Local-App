import type { Holding } from '../types/portfolio'
import { SecurityType } from '../types/enums'

/**
 * Mock holdings data for development and testing
 * In a real application, this would come from the portfolio store
 */
export const mockHoldings: Holding[] = [
  {
    id: 'holding-1',
    symbol: 'VTI',
    securityName: 'Vanguard Total Stock Market ETF',
    securityType: SecurityType.ETF,
    quantity: 100,
    currentPrice: 220.50,
    purchasePrice: 200.00,
    purchaseDate: new Date('2023-01-01'),
    lastUpdated: new Date()
  },
  {
    id: 'holding-2', 
    symbol: 'BND',
    securityName: 'Vanguard Total Bond Market ETF',
    securityType: SecurityType.ETF,
    quantity: 50,
    currentPrice: 75.25,
    purchasePrice: 80.00,
    purchaseDate: new Date('2023-02-01'),
    lastUpdated: new Date()
  },
  {
    id: 'holding-3',
    symbol: 'VTIAX',
    securityName: 'Vanguard Total International Stock Index Fund',
    securityType: SecurityType.MUTUAL_FUND,
    quantity: 25,
    currentPrice: 28.75,
    purchasePrice: 27.50,
    purchaseDate: new Date('2023-03-01'),
    lastUpdated: new Date()
  }
]

/**
 * Mock goals data for development and testing
 */
export const mockGoals = [
  {
    id: 'goal-1',
    name: 'Emergency Fund',
    targetAmount: 30000,
    currentAmount: 22500,
    targetDate: new Date('2024-12-31'),
    category: 'emergency',
    priority: 'high'
  },
  {
    id: 'goal-2',
    name: 'Retirement',
    targetAmount: 1000000,
    currentAmount: 125000,
    targetDate: new Date('2055-01-01'),
    category: 'retirement',
    priority: 'high'
  },
  {
    id: 'goal-3',
    name: 'House Down Payment',
    targetAmount: 80000,
    currentAmount: 15000,
    targetDate: new Date('2027-06-01'),
    category: 'major_purchase',
    priority: 'medium'
  }
]

/**
 * Calculate portfolio metrics from holdings
 */
export const calculatePortfolioMetrics = (holdings: Holding[]) => {
  const totalValue = holdings.reduce((sum, holding) => 
    sum + (holding.quantity * (holding.currentPrice || holding.purchasePrice)), 0
  )
  const totalCost = holdings.reduce((sum, holding) => 
    sum + (holding.quantity * holding.purchasePrice), 0
  )
  const totalGain = totalValue - totalCost
  const gainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0
  
  return {
    totalValue,
    totalCost,
    totalGain,
    gainPercent,
    holdingsCount: holdings.length
  }
}

/**
 * Calculate goal progress metrics
 */
export const calculateGoalMetrics = (goals: typeof mockGoals) => {
  const totalGoals = goals.length
  const completedGoals = goals.filter(goal => goal.currentAmount >= goal.targetAmount).length
  const totalProgress = goals.reduce((sum, goal) => 
    sum + (goal.currentAmount / goal.targetAmount), 0
  ) / totalGoals * 100
  
  const monthlyProgress = goals.reduce((sum, goal) => {
    const monthsRemaining = Math.max(1, 
      Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30))
    )
    const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount)
    return sum + (remainingAmount / monthsRemaining)
  }, 0)
  
  return {
    totalGoals,
    completedGoals,
    totalProgress,
    monthlyProgress
  }
}
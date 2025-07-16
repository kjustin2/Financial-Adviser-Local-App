import { create } from 'zustand'
import type { SimpleRecommendation, SimpleUserProfile, SimpleGoal } from '../types/simple'

interface RecommendationsState {
  recommendations: SimpleRecommendation[]
  isLoading: boolean
  error: string | null
  
  // Actions
  generateRecommendations: (profile: SimpleUserProfile, goals: SimpleGoal[]) => Promise<void>
  dismissRecommendation: (recommendationId: string) => void
  getRecommendationsByUser: (userId: string) => SimpleRecommendation[]
}

import { FINANCIAL_CONSTANTS } from '../constants/financial'

// Enhanced recommendation templates with detailed descriptions
const RECOMMENDATION_TEMPLATES = {
  emergencyFund: {
    title: 'Build Emergency Fund',
    description: 'An emergency fund is crucial for financial stability. It protects you from unexpected expenses like medical bills, car repairs, or job loss. Financial experts recommend saving 3-6 months of living expenses in a readily accessible account.',
    category: 'savings' as const,
    actionText: 'Open a high-yield savings account and set up automatic transfers to build your emergency fund gradually. Start with $500 and work toward 3 months of expenses.'
  },
  highDebt: {
    title: 'Reduce High-Interest Debt',
    description: 'High-interest debt, especially credit card debt, can significantly impact your financial health. The interest charges can quickly compound, making it harder to pay off the principal balance and limiting your ability to save and invest.',
    category: 'debt' as const,
    actionText: 'List all debts by interest rate and focus extra payments on the highest rate debt first (debt avalanche method). Consider debt consolidation if it lowers your overall interest rate.'
  },
  increaseSavings: {
    title: 'Increase Monthly Savings Rate',
    description: 'A healthy savings rate of 15-20% of your income is essential for long-term financial security. This includes retirement savings, emergency funds, and other financial goals. The earlier you start, the more compound interest works in your favor.',
    category: 'savings' as const,
    actionText: 'Review your budget to identify areas where you can cut expenses. Automate your savings by setting up direct deposits into savings accounts. Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings.'
  },
  riskTolerance: {
    title: 'Align Risk Tolerance with Age',
    description: 'Your investment risk tolerance should generally align with your age and time horizon. Younger investors can typically afford more risk for higher potential returns, while older investors may prefer more conservative approaches.',
    category: 'risk' as const,
    actionText: 'Review your investment portfolio allocation. Consider age-based rules like "100 minus your age" for stock allocation percentage. Rebalance your portfolio annually to maintain your target allocation.'
  },
  goalProgress: {
    title: 'Accelerate Goal Achievement',
    description: 'Some of your financial goals may be falling behind schedule based on your current contribution rate. Staying on track requires regular monitoring and adjustments to ensure you meet your target dates.',
    category: 'goals' as const,
    actionText: 'Calculate the required monthly contribution for each goal and adjust your budget accordingly. Consider increasing contributions when you receive raises or bonuses. Prioritize goals by importance and timeline.'
  },
  retirementSavings: {
    title: 'Start Retirement Planning',
    description: 'Retirement planning is crucial regardless of your age, but starting early gives you a significant advantage due to compound interest. Even small contributions can grow substantially over time.',
    category: 'goals' as const,
    actionText: 'Open a retirement account (401k, IRA, or Roth IRA) and start contributing regularly. Take advantage of employer matching if available. Aim to save at least 10-15% of your income for retirement.'
  },
  budgetOptimization: {
    title: 'Optimize Your Budget',
    description: 'When your expenses consume too much of your income, it limits your ability to save, invest, and build wealth. A well-optimized budget ensures you live within your means while maximizing savings potential.',
    category: 'savings' as const,
    actionText: 'Track your expenses for a month to identify spending patterns. Look for subscriptions you don\'t use, dining out frequency, and other discretionary spending. Aim to keep total expenses below 80% of income.'
  },
  debtToIncomeRatio: {
    title: 'Improve Debt-to-Income Ratio',
    description: 'Your debt payments are consuming a significant portion of your monthly income, which can limit your financial flexibility and ability to save for other goals. A healthy debt-to-income ratio is typically below 36% of gross monthly income.',
    category: 'debt' as const,
    actionText: 'Consider debt consolidation to lower interest rates, create a debt repayment plan, or explore ways to increase your income. Focus on paying off high-interest debt first while making minimum payments on others.'
  },
  youngInvestor: {
    title: 'Take Advantage of Time',
    description: 'As a young investor, you have time on your side for long-term growth. This allows you to take on more investment risk for potentially higher returns, as you have decades to recover from market downturns.',
    category: 'risk' as const,
    actionText: 'Consider increasing your stock allocation in investment accounts. Look into low-cost index funds or ETFs that track broad market indices. Take advantage of compound growth by starting early and investing consistently.'
  },
  conservativeApproach: {
    title: 'Focus on Stability',
    description: 'Given your age and risk profile, a more conservative investment approach may be appropriate. This focuses on capital preservation and steady income rather than aggressive growth, helping protect your wealth as you approach or are in retirement.',
    category: 'risk' as const,
    actionText: 'Consider increasing your allocation to bonds, dividend-paying stocks, and other stable investments. Review your portfolio to ensure it aligns with your risk tolerance and time horizon. Consider working with a financial advisor for personalized guidance.'
  }
} as const

// Helper function to generate recommendations based on profile and goals
const generateRecommendationsList = (profile: SimpleUserProfile, goals: SimpleGoal[]): SimpleRecommendation[] => {
  const recommendations: SimpleRecommendation[] = []
  
  // Calculate key financial metrics
  const monthlyExpenses = profile.monthlyExpenses
  const emergencyTarget = monthlyExpenses * FINANCIAL_CONSTANTS.EMERGENCY_FUND_MONTHS
  const savingsRate = profile.monthlySavings / profile.monthlyIncome
  const debtToIncomeRatio = profile.currentDebt / (profile.monthlyIncome * 12)
  const expenseToIncomeRatio = profile.monthlyExpenses / profile.monthlyIncome
  
  // 1. Emergency fund recommendation (HIGH PRIORITY)
  if (profile.emergencyFund < emergencyTarget) {
    recommendations.push({
      id: crypto.randomUUID(),
      userId: profile.id,
      ...RECOMMENDATION_TEMPLATES.emergencyFund,
      priority: 'high',
      createdAt: new Date()
    })
  }

  // 2. High debt recommendation (HIGH PRIORITY)
  if (profile.currentDebt > profile.monthlyIncome * 2) {
    recommendations.push({
      id: crypto.randomUUID(),
      userId: profile.id,
      ...RECOMMENDATION_TEMPLATES.highDebt,
      priority: 'high',
      createdAt: new Date()
    })
  }

  // 3. Debt-to-income ratio recommendation (HIGH PRIORITY)
  if (debtToIncomeRatio > FINANCIAL_CONSTANTS.CRITICAL_DEBT_RATIO) {
    recommendations.push({
      id: crypto.randomUUID(),
      userId: profile.id,
      ...RECOMMENDATION_TEMPLATES.debtToIncomeRatio,
      priority: 'high',
      createdAt: new Date()
    })
  }

  // 4. Budget optimization (MEDIUM PRIORITY)
  if (expenseToIncomeRatio > FINANCIAL_CONSTANTS.HIGH_EXPENSE_RATIO) {
    recommendations.push({
      id: crypto.randomUUID(),
      userId: profile.id,
      ...RECOMMENDATION_TEMPLATES.budgetOptimization,
      priority: 'medium',
      createdAt: new Date()
    })
  }

  // 5. Savings rate recommendation (MEDIUM PRIORITY)
  if (savingsRate < FINANCIAL_CONSTANTS.GOOD_SAVINGS_RATE) {
    recommendations.push({
      id: crypto.randomUUID(),
      userId: profile.id,
      ...RECOMMENDATION_TEMPLATES.increaseSavings,
      priority: 'medium',
      createdAt: new Date()
    })
  }

  // 6. Retirement planning recommendation (MEDIUM PRIORITY)
  const hasRetirementGoal = goals.some(goal => goal.type === 'retirement')
  if (!hasRetirementGoal && profile.age < 50) {
    recommendations.push({
      id: crypto.randomUUID(),
      userId: profile.id,
      ...RECOMMENDATION_TEMPLATES.retirementSavings,
      priority: 'medium',
      createdAt: new Date()
    })
  }

  // 7. Goal progress recommendation (MEDIUM PRIORITY)
  if (goals.length > 0) {
    const behindGoals = goals.filter(goal => {
      const monthsToTarget = Math.ceil((goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30))
      if (monthsToTarget <= 0) return false
      const neededMonthly = (goal.targetAmount - goal.currentAmount) / monthsToTarget
      return goal.monthlyContribution < neededMonthly * FINANCIAL_CONSTANTS.GOAL_PROGRESS_THRESHOLD
    })

    if (behindGoals.length > 0) {
      recommendations.push({
        id: crypto.randomUUID(),
        userId: profile.id,
        ...RECOMMENDATION_TEMPLATES.goalProgress,
        priority: 'medium',
        createdAt: new Date()
      })
    }
  }

  // 8. Risk tolerance recommendations (LOW PRIORITY)
  if (profile.age <= FINANCIAL_CONSTANTS.YOUNG_INVESTOR_AGE && profile.riskTolerance === 'low') {
    recommendations.push({
      id: crypto.randomUUID(),
      userId: profile.id,
      ...RECOMMENDATION_TEMPLATES.youngInvestor,
      priority: 'low',
      createdAt: new Date()
    })
  } else if (profile.age >= FINANCIAL_CONSTANTS.MATURE_INVESTOR_AGE && profile.riskTolerance === 'high') {
    recommendations.push({
      id: crypto.randomUUID(),
      userId: profile.id,
      ...RECOMMENDATION_TEMPLATES.conservativeApproach,
      priority: 'low',
      createdAt: new Date()
    })
  }

  return recommendations
}

// Helper function to prioritize and limit recommendations
const prioritizeAndLimitRecommendations = (recommendations: SimpleRecommendation[]): SimpleRecommendation[] => {
  // Sort recommendations by priority (high -> medium -> low)
  const priorityOrder = { high: 3, medium: 2, low: 1 }
  const sortedRecommendations = recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])

  // Limit to maximum recommendations to avoid overwhelming the user
  return sortedRecommendations.slice(0, FINANCIAL_CONSTANTS.MAX_RECOMMENDATIONS)
}

export const useSimpleRecommendationsStore = create<RecommendationsState>((set, get) => ({
  recommendations: [],
  isLoading: false,
  error: null,

  generateRecommendations: async (profile: SimpleUserProfile, goals: SimpleGoal[]) => {
    set({ isLoading: true, error: null })
    try {
      const generatedRecommendations = generateRecommendationsList(profile, goals)
      const finalRecommendations = prioritizeAndLimitRecommendations(generatedRecommendations)

      set({ recommendations: finalRecommendations, isLoading: false })
    } catch (error) {
      set({ error: 'Failed to generate recommendations', isLoading: false })
      throw error
    }
  },

  dismissRecommendation: (recommendationId: string) => {
    set(state => ({
      recommendations: state.recommendations.filter(rec => rec.id !== recommendationId)
    }))
  },

  getRecommendationsByUser: (userId: string) => {
    return get().recommendations.filter(rec => rec.userId === userId)
  },
}))
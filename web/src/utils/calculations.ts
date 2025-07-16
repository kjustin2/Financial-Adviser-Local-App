import { FINANCIAL_CONSTANTS } from '../constants/financial'
import type { FinancialMetrics } from '../types/simple'

// Financial profile interface for calculations
interface FinancialProfile {
  monthlyIncome: number
  monthlySavings: number
  monthlyExpenses: number
  currentDebt: number
  emergencyFund: number
}

// Calculate key financial ratios
export const calculateFinancialMetrics = (profile: FinancialProfile): FinancialMetrics => {
  const { monthlyIncome, monthlySavings, monthlyExpenses, currentDebt, emergencyFund } = profile
  
  return {
    savingsRate: monthlyIncome > 0 ? monthlySavings / monthlyIncome : 0,
    expenseRatio: monthlyIncome > 0 ? monthlyExpenses / monthlyIncome : 1,
    debtToIncomeRatio: monthlyIncome > 0 ? (currentDebt / 12) / monthlyIncome : 0,
    emergencyFundMonths: monthlyExpenses > 0 ? emergencyFund / monthlyExpenses : 0
  }
}

// Calculate score for individual financial components
const calculateSavingsRateScore = (savingsRate: number): number => {
  if (savingsRate >= FINANCIAL_CONSTANTS.EXCELLENT_SAVINGS_RATE) return FINANCIAL_CONSTANTS.SAVINGS_RATE_WEIGHT
  if (savingsRate >= FINANCIAL_CONSTANTS.GOOD_SAVINGS_RATE) return 25
  if (savingsRate >= FINANCIAL_CONSTANTS.FAIR_SAVINGS_RATE) return 20
  if (savingsRate >= FINANCIAL_CONSTANTS.MINIMUM_SAVINGS_RATE) return 10
  return 0
}

const calculateExpenseRatioScore = (expenseRatio: number): number => {
  if (expenseRatio <= FINANCIAL_CONSTANTS.EXCELLENT_EXPENSE_RATIO) return FINANCIAL_CONSTANTS.EXPENSE_RATIO_WEIGHT
  if (expenseRatio <= FINANCIAL_CONSTANTS.GOOD_EXPENSE_RATIO) return 20
  if (expenseRatio <= FINANCIAL_CONSTANTS.FAIR_EXPENSE_RATIO) return 15
  if (expenseRatio <= FINANCIAL_CONSTANTS.HIGH_EXPENSE_RATIO) return 10
  return 0
}

const calculateDebtRatioScore = (debtToIncomeRatio: number): number => {
  if (debtToIncomeRatio <= FINANCIAL_CONSTANTS.LOW_DEBT_RATIO) return FINANCIAL_CONSTANTS.DEBT_RATIO_WEIGHT
  if (debtToIncomeRatio <= FINANCIAL_CONSTANTS.MODERATE_DEBT_RATIO) return 20
  if (debtToIncomeRatio <= FINANCIAL_CONSTANTS.HIGH_DEBT_RATIO) return 15
  if (debtToIncomeRatio <= FINANCIAL_CONSTANTS.CRITICAL_DEBT_RATIO) return 10
  return 0
}

const calculateEmergencyFundScore = (emergencyMonths: number): number => {
  if (emergencyMonths >= FINANCIAL_CONSTANTS.IDEAL_EMERGENCY_FUND_MONTHS) return FINANCIAL_CONSTANTS.EMERGENCY_FUND_WEIGHT
  if (emergencyMonths >= FINANCIAL_CONSTANTS.EMERGENCY_FUND_MONTHS) return 15
  if (emergencyMonths >= 1) return 10
  if (emergencyMonths >= 0.5) return 5
  return 0
}

// Financial health score breakdown interface
export interface FinancialHealthBreakdown {
  totalScore: number
  components: {
    savingsRate: { score: number; maxScore: number; status: 'excellent' | 'good' | 'fair' | 'poor'; description: string }
    expenseManagement: { score: number; maxScore: number; status: 'excellent' | 'good' | 'fair' | 'poor'; description: string }
    debtManagement: { score: number; maxScore: number; status: 'excellent' | 'good' | 'fair' | 'poor'; description: string }
    emergencyPreparedness: { score: number; maxScore: number; status: 'excellent' | 'good' | 'fair' | 'poor'; description: string }
  }
  recommendations: string[]
}

// Helper function to determine status based on score percentage
const getScoreStatus = (score: number, maxScore: number): 'excellent' | 'good' | 'fair' | 'poor' => {
  const percentage = (score / maxScore) * 100
  if (percentage >= 90) return 'excellent'
  if (percentage >= 70) return 'good'
  if (percentage >= 50) return 'fair'
  return 'poor'
}

// Main financial health score calculation
export const calculateFinancialHealthScore = (profile: FinancialProfile): number => {
  const metrics = calculateFinancialMetrics(profile)
  
  const savingsScore = calculateSavingsRateScore(metrics.savingsRate)
  const expenseScore = calculateExpenseRatioScore(metrics.expenseRatio)
  const debtScore = calculateDebtRatioScore(metrics.debtToIncomeRatio)
  const emergencyScore = calculateEmergencyFundScore(metrics.emergencyFundMonths)
  
  const totalScore = savingsScore + expenseScore + debtScore + emergencyScore
  
  return Math.min(Math.max(totalScore, 0), 100)
}

// Detailed financial health score breakdown
export const calculateFinancialHealthBreakdown = (profile: FinancialProfile): FinancialHealthBreakdown => {
  const metrics = calculateFinancialMetrics(profile)
  
  const savingsScore = calculateSavingsRateScore(metrics.savingsRate)
  const expenseScore = calculateExpenseRatioScore(metrics.expenseRatio)
  const debtScore = calculateDebtRatioScore(metrics.debtToIncomeRatio)
  const emergencyScore = calculateEmergencyFundScore(metrics.emergencyFundMonths)
  
  const totalScore = Math.min(Math.max(savingsScore + expenseScore + debtScore + emergencyScore, 0), 100)
  
  const recommendations: string[] = []
  
  // Generate recommendations based on scores
  if (savingsScore < FINANCIAL_CONSTANTS.SAVINGS_RATE_WEIGHT * 0.7) {
    recommendations.push('Increase your monthly savings rate to at least 15% of income')
  }
  if (expenseScore < FINANCIAL_CONSTANTS.EXPENSE_RATIO_WEIGHT * 0.7) {
    recommendations.push('Review and reduce monthly expenses to improve cash flow')
  }
  if (debtScore < FINANCIAL_CONSTANTS.DEBT_RATIO_WEIGHT * 0.7) {
    recommendations.push('Focus on paying down high-interest debt')
  }
  if (emergencyScore < FINANCIAL_CONSTANTS.EMERGENCY_FUND_WEIGHT * 0.7) {
    recommendations.push('Build emergency fund to cover 3-6 months of expenses')
  }
  
  return {
    totalScore,
    components: {
      savingsRate: {
        score: savingsScore,
        maxScore: FINANCIAL_CONSTANTS.SAVINGS_RATE_WEIGHT,
        status: getScoreStatus(savingsScore, FINANCIAL_CONSTANTS.SAVINGS_RATE_WEIGHT),
        description: `You save ${(metrics.savingsRate * 100).toFixed(1)}% of your income`
      },
      expenseManagement: {
        score: expenseScore,
        maxScore: FINANCIAL_CONSTANTS.EXPENSE_RATIO_WEIGHT,
        status: getScoreStatus(expenseScore, FINANCIAL_CONSTANTS.EXPENSE_RATIO_WEIGHT),
        description: `Your expenses are ${(metrics.expenseRatio * 100).toFixed(1)}% of your income`
      },
      debtManagement: {
        score: debtScore,
        maxScore: FINANCIAL_CONSTANTS.DEBT_RATIO_WEIGHT,
        status: getScoreStatus(debtScore, FINANCIAL_CONSTANTS.DEBT_RATIO_WEIGHT),
        description: `Your debt-to-income ratio is ${(metrics.debtToIncomeRatio * 100).toFixed(1)}%`
      },
      emergencyPreparedness: {
        score: emergencyScore,
        maxScore: FINANCIAL_CONSTANTS.EMERGENCY_FUND_WEIGHT,
        status: getScoreStatus(emergencyScore, FINANCIAL_CONSTANTS.EMERGENCY_FUND_WEIGHT),
        description: `Your emergency fund covers ${metrics.emergencyFundMonths.toFixed(1)} months of expenses`
      }
    },
    recommendations
  }
}

export const calculateGoalProgress = (currentAmount: number, targetAmount: number): number => {
  if (targetAmount <= 0) return 0
  return Math.min((currentAmount / targetAmount) * 100, 100)
}

export const calculateMonthsToGoal = (
  currentAmount: number,
  targetAmount: number,
  monthlyContribution: number
): number => {
  if (monthlyContribution <= 0 || targetAmount <= currentAmount) return 0
  return Math.ceil((targetAmount - currentAmount) / monthlyContribution)
}

export const calculateRequiredMonthlyContribution = (
  currentAmount: number,
  targetAmount: number,
  monthsToTarget: number
): number => {
  if (monthsToTarget <= 0 || targetAmount <= currentAmount) return 0
  return Math.ceil((targetAmount - currentAmount) / monthsToTarget)
}

export const calculateEmergencyFundTarget = (monthlyExpenses: number): number => {
  return monthlyExpenses * 3 // 3 months of expenses as basic target
}

export const calculateDebtToIncomeRatio = (monthlyDebtPayments: number, monthlyIncome: number): number => {
  if (monthlyIncome <= 0) return 0
  return (monthlyDebtPayments / monthlyIncome) * 100
}

export const calculateSavingsRate = (monthlySavings: number, monthlyIncome: number): number => {
  if (monthlyIncome <= 0) return 0
  return (monthlySavings / monthlyIncome) * 100
}
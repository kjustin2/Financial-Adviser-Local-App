import type { Goal, GoalCalculations } from '../types'

export const calculateGoalProgress = (goal: Goal): GoalCalculations => {
  const progressPercentage = goal.targetAmount > 0 ? 
    Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0
  
  const remainingAmount = Math.max(goal.targetAmount - goal.currentAmount, 0)
  
  const today = new Date()
  const targetDate = new Date(goal.targetDate)
  const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  const monthsRemaining = Math.max(daysRemaining / 30.44, 0.1) // Avoid division by zero
  const monthlyRequiredSavings = remainingAmount / monthsRemaining
  
  const isNearCompletion = progressPercentage >= 75
  const isOverdue = daysRemaining < 0
  
  return {
    progressPercentage,
    remainingAmount,
    daysRemaining,
    monthlyRequiredSavings,
    isNearCompletion,
    isOverdue
  }
}

export const calculateCompoundGrowth = (
  principal: number,
  monthlyContribution: number,
  annualRate: number,
  years: number
): number => {
  const monthlyRate = annualRate / 12
  const months = years * 12
  
  // Future value of principal
  const principalGrowth = principal * Math.pow(1 + monthlyRate, months)
  
  // Future value of monthly contributions (annuity)
  const contributionGrowth = monthlyContribution * 
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
  
  return principalGrowth + contributionGrowth
}

export const calculateRequiredSavingsRate = (
  currentAge: number,
  retirementAge: number,
  currentSavings: number,
  targetAmount: number,
  annualReturn: number = 0.07
): number => {
  const years = retirementAge - currentAge
  if (years <= 0) return 0
  
  const monthlyRate = annualReturn / 12
  const months = years * 12
  
  // Future value of current savings
  const futureValueCurrent = currentSavings * Math.pow(1 + monthlyRate, months)
  
  // Remaining amount needed from monthly contributions
  const remainingNeeded = targetAmount - futureValueCurrent
  
  if (remainingNeeded <= 0) return 0
  
  // Required monthly contribution
  const monthlyContribution = remainingNeeded / 
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
  
  return Math.max(monthlyContribution, 0)
}

export const calculateRetirementReadiness = (
  currentAge: number,
  currentSavings: number,
  monthlyContribution: number,
  targetRetirementIncome: number,
  retirementAge: number = 65
): {
  projectedSavings: number
  requiredSavings: number
  readinessPercentage: number
  shortfall: number
} => {
  const years = Math.max(retirementAge - currentAge, 0)
  const projectedSavings = calculateCompoundGrowth(currentSavings, monthlyContribution, 0.07, years)
  
  // Rule of thumb: need 25x annual retirement income (4% withdrawal rule)
  const requiredSavings = targetRetirementIncome * 25
  
  const readinessPercentage = requiredSavings > 0 ? 
    Math.min((projectedSavings / requiredSavings) * 100, 100) : 100
  
  const shortfall = Math.max(requiredSavings - projectedSavings, 0)
  
  return {
    projectedSavings,
    requiredSavings,
    readinessPercentage,
    shortfall
  }
}
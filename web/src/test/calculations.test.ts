import { describe, it, expect } from 'vitest'
import {
  calculateFinancialHealthScore,
  calculateGoalProgress,
  calculateMonthsToGoal,
  calculateRequiredMonthlyContribution,
  calculateEmergencyFundTarget,
  calculateSavingsRate
} from '../utils/calculations'

describe('Financial Calculations', () => {
  describe('calculateFinancialHealthScore', () => {
    it('should return high score for good financial health', () => {
      const profile = {
        monthlyIncome: 5000,
        monthlySavings: 1000, // 20% savings rate
        monthlyExpenses: 2500, // 50% expense ratio
        currentDebt: 0,
        emergencyFund: 15000 // 6 months expenses
      }
      
      const score = calculateFinancialHealthScore(profile)
      expect(score).toBeGreaterThan(80)
    })

    it('should return low score for poor financial health', () => {
      const profile = {
        monthlyIncome: 3000,
        monthlySavings: 0, // 0% savings rate
        monthlyExpenses: 2800, // 93% expense ratio
        currentDebt: 50000, // High debt
        emergencyFund: 0 // No emergency fund
      }
      
      const score = calculateFinancialHealthScore(profile)
      expect(score).toBeLessThan(30)
    })

    it('should handle zero income gracefully', () => {
      const profile = {
        monthlyIncome: 0,
        monthlySavings: 0,
        monthlyExpenses: 1000,
        currentDebt: 0,
        emergencyFund: 0
      }
      
      const score = calculateFinancialHealthScore(profile)
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })
  })

  describe('calculateGoalProgress', () => {
    it('should calculate correct progress percentage', () => {
      expect(calculateGoalProgress(2500, 10000)).toBe(25)
      expect(calculateGoalProgress(7500, 10000)).toBe(75)
      expect(calculateGoalProgress(10000, 10000)).toBe(100)
    })

    it('should not exceed 100%', () => {
      expect(calculateGoalProgress(15000, 10000)).toBe(100)
    })

    it('should handle zero target amount', () => {
      expect(calculateGoalProgress(1000, 0)).toBe(0)
    })
  })

  describe('calculateMonthsToGoal', () => {
    it('should calculate correct months to reach goal', () => {
      expect(calculateMonthsToGoal(2000, 10000, 500)).toBe(16)
      expect(calculateMonthsToGoal(0, 6000, 1000)).toBe(6)
    })

    it('should return 0 for zero or negative contribution', () => {
      expect(calculateMonthsToGoal(1000, 5000, 0)).toBe(0)
      expect(calculateMonthsToGoal(1000, 5000, -100)).toBe(0)
    })

    it('should return 0 if already at or above target', () => {
      expect(calculateMonthsToGoal(5000, 5000, 100)).toBe(0)
      expect(calculateMonthsToGoal(6000, 5000, 100)).toBe(0)
    })
  })

  describe('calculateRequiredMonthlyContribution', () => {
    it('should calculate correct monthly contribution needed', () => {
      expect(calculateRequiredMonthlyContribution(2000, 10000, 16)).toBe(500)
      expect(calculateRequiredMonthlyContribution(0, 6000, 6)).toBe(1000)
    })

    it('should return 0 for zero or negative months', () => {
      expect(calculateRequiredMonthlyContribution(1000, 5000, 0)).toBe(0)
      expect(calculateRequiredMonthlyContribution(1000, 5000, -5)).toBe(0)
    })

    it('should return 0 if already at or above target', () => {
      expect(calculateRequiredMonthlyContribution(5000, 5000, 12)).toBe(0)
      expect(calculateRequiredMonthlyContribution(6000, 5000, 12)).toBe(0)
    })
  })

  describe('calculateEmergencyFundTarget', () => {
    it('should calculate 3 months of expenses', () => {
      expect(calculateEmergencyFundTarget(2000)).toBe(6000)
      expect(calculateEmergencyFundTarget(3500)).toBe(10500)
    })

    it('should handle zero expenses', () => {
      expect(calculateEmergencyFundTarget(0)).toBe(0)
    })
  })

  describe('calculateSavingsRate', () => {
    it('should calculate correct savings rate percentage', () => {
      expect(calculateSavingsRate(1000, 5000)).toBe(20)
      expect(calculateSavingsRate(750, 3000)).toBe(25)
    })

    it('should return 0 for zero income', () => {
      expect(calculateSavingsRate(500, 0)).toBe(0)
    })

    it('should handle zero savings', () => {
      expect(calculateSavingsRate(0, 5000)).toBe(0)
    })
  })
})
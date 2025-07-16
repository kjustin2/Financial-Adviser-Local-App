import { PortfolioAnalytics } from '../services/analytics'
import { SecurityType, RiskTolerance, TimeHorizon, ExperienceLevel } from '../types'

describe('PortfolioAnalytics', () => {
  const mockHolding = {
    id: '1',
    symbol: 'AAPL',
    securityName: 'Apple Inc.',
    securityType: SecurityType.STOCK,
    quantity: 10,
    purchasePrice: 150,
    purchaseDate: new Date('2023-01-01'),
    currentPrice: 180,
    lastUpdated: new Date()
  }

  const mockProfile = {
    id: '1',
    personalInfo: {
      name: 'Test User',
      age: 35,
      incomeRange: '$50,000 - $100,000'
    },
    investmentProfile: {
      experienceLevel: 'INTERMEDIATE' as ExperienceLevel,
      riskTolerance: RiskTolerance.MODERATE,
      riskScore: 5,
      investmentKnowledge: []
    },
    goals: {
      primaryGoals: ['retirement', 'house'],
      timeHorizon: TimeHorizon.LONG_TERM,
      specificGoalAmounts: {}
    },
    currentSituation: {
      existingInvestments: 50000,
      monthlySavings: 1000,
      emergencyFund: 10000,
      currentDebt: 0
    },
    preferences: {
      communicationStyle: 'detailed' as const,
      updateFrequency: 'monthly' as const
    },
    onboardingCompleted: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    // Legacy fields for backward compatibility
    name: 'Test User',
    age: 35,
    incomeRange: '$50,000 - $100,000',
    experienceLevel: 'INTERMEDIATE' as ExperienceLevel,
    riskTolerance: RiskTolerance.MODERATE,
    financialGoals: ['retirement', 'house'],
    timeHorizon: TimeHorizon.LONG_TERM,
    majorPurchases: []
  }

  describe('calculateHoldingMetrics', () => {
    it('should calculate holding metrics correctly', () => {
      const metrics = PortfolioAnalytics.calculateHoldingMetrics(mockHolding)
      
      expect(metrics.totalCostBasis).toBe(1500) // 10 * 150
      expect(metrics.currentValue).toBe(1800) // 10 * 180
      expect(metrics.unrealizedGainLoss).toBe(300) // 1800 - 1500
      expect(metrics.unrealizedGainLossPercent).toBe(20) // (300 / 1500) * 100
      expect(metrics.isProfitable).toBe(true)
    })
  })

  describe('calculateTotalValue', () => {
    it('should calculate total portfolio value', () => {
      const holdings = [mockHolding]
      const totalValue = PortfolioAnalytics.calculateTotalValue(holdings)
      
      expect(totalValue).toBe(1800)
    })

    it('should return 0 for empty portfolio', () => {
      const totalValue = PortfolioAnalytics.calculateTotalValue([])
      expect(totalValue).toBe(0)
    })
  })

  describe('suggestTargetAllocation', () => {
    it('should suggest appropriate allocation for moderate risk tolerance', () => {
      const allocation = PortfolioAnalytics.suggestTargetAllocation(mockProfile)
      
      expect(allocation.stocks).toBeGreaterThan(0)
      expect(allocation.bonds).toBeGreaterThan(0)
      expect(allocation.stocks + allocation.bonds).toBeLessThanOrEqual(100)
    })
  })
})
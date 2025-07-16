import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { storageService } from '../../services/storage'
import { PortfolioAnalytics } from '../../services/analytics'
import { RecommendationEngine } from '../../services/recommendations'
import { SecurityType, RiskTolerance, TimeHorizon, ExperienceLevel, GoalCategory, GoalPriority } from '../../types'

describe('Portfolio Integration Tests', () => {
  beforeEach(async () => {
    // Clear the database before each test
    await storageService.clearAllData()
  })

  afterEach(async () => {
    // Clean up after each test
    await storageService.clearAllData()
  })

  it('should create a complete user workflow', async () => {
    // 1. Create user profile
    const profileData = {
      personalInfo: {
        name: 'Test User',
        age: 35,
        incomeRange: '$75,000 - $100,000'
      },
      investmentProfile: {
        experienceLevel: ExperienceLevel.INTERMEDIATE,
        riskTolerance: RiskTolerance.MODERATE,
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
      }
    }

    const profile = await storageService.createProfile(profileData)
    expect(profile.personalInfo.name).toBe('Test User')
    expect(profile.personalInfo.age).toBe(35)

    // 2. Add holdings
    const holding1 = await storageService.createHolding({
      symbol: 'AAPL',
      securityName: 'Apple Inc.',
      securityType: SecurityType.STOCK,
      quantity: 10,
      purchasePrice: 150,
      purchaseDate: new Date('2023-01-01'),
      currentPrice: 180
    })

    const holding2 = await storageService.createHolding({
      symbol: 'VTSAX',
      securityName: 'Vanguard Total Stock Market Index',
      securityType: SecurityType.MUTUAL_FUND,
      quantity: 100,
      purchasePrice: 100,
      purchaseDate: new Date('2023-02-01'),
      currentPrice: 110
    })

    expect(holding1.symbol).toBe('AAPL')
    expect(holding2.symbol).toBe('VTSAX')

    // 3. Get all holdings and verify
    const holdings = await storageService.getHoldings()
    expect(holdings).toHaveLength(2)

    // 4. Generate portfolio analysis
    const analysis = PortfolioAnalytics.generatePortfolioAnalysis(holdings)
    
    expect(analysis.summary.totalValue).toBe(12800) // (10 * 180) + (100 * 110)
    expect(analysis.summary.totalCostBasis).toBe(11500) // (10 * 150) + (100 * 100)
    expect(analysis.summary.totalGainLoss).toBe(1300)
    expect(analysis.allocations).toHaveLength(2)

    // 5. Generate recommendations
    const recommendations = RecommendationEngine.generateRecommendations(profile, holdings)
    expect(recommendations.length).toBeGreaterThan(0)

    // 6. Save recommendations
    for (const rec of recommendations) {
      const createData = {
        type: rec.type,
        priority: rec.priority,
        title: rec.title,
        description: rec.description,
        reasoning: rec.reasoning,
        actionItems: rec.actionItems.map(item => item.description)
      }
      await storageService.createRecommendation(createData)
    }

    const savedRecommendations = await storageService.getRecommendations()
    expect(savedRecommendations.length).toBe(recommendations.length)

    // 7. Create a goal
    const goalData = {
      name: 'Emergency Fund',
      category: 'emergency' as GoalCategory,
      targetAmount: 10000,
      targetDate: new Date('2024-12-31'),
      currentAmount: 2500,
      priority: 'high' as GoalPriority
    }

    const goal = await storageService.createGoal(goalData)
    expect(goal.name).toBe('Emergency Fund')
    expect(goal.targetAmount).toBe(10000)
  })

  it('should handle portfolio analytics correctly', async () => {
    const holdings = [
      {
        id: '1',
        symbol: 'AAPL',
        securityName: 'Apple Inc.',
        securityType: SecurityType.STOCK,
        quantity: 10,
        purchasePrice: 150,
        purchaseDate: new Date('2023-01-01'),
        currentPrice: 180,
        lastUpdated: new Date()
      },
      {
        id: '2',
        symbol: 'GOOGL',
        securityName: 'Alphabet Inc.',
        securityType: SecurityType.STOCK,
        quantity: 5,
        purchasePrice: 2000,
        purchaseDate: new Date('2023-02-01'),
        currentPrice: 2200,
        lastUpdated: new Date()
      }
    ]

    const totalValue = PortfolioAnalytics.calculateTotalValue(holdings)
    expect(totalValue).toBe(12800) // (10 * 180) + (5 * 2200)

    const performance = PortfolioAnalytics.calculatePerformanceMetrics(holdings)
    expect(performance.totalValue).toBe(12800)
    expect(performance.totalCostBasis).toBe(11500) // (10 * 150) + (5 * 2000)
    expect(performance.totalGainLoss).toBe(1300)
    expect(performance.totalReturnPercent).toBeCloseTo(11.3, 1)

    const diversification = PortfolioAnalytics.analyzeDiversification(holdings)
    expect(diversification.overallScore).toBeGreaterThan(0)
    expect(diversification.recommendations).toBeInstanceOf(Array)
  })

  it('should handle data persistence correctly', async () => {
    // Create and save a profile
    const profileData = {
      personalInfo: {
        name: 'Persistence Test',
        age: 30,
        incomeRange: '$50,000 - $75,000'
      },
      investmentProfile: {
        experienceLevel: ExperienceLevel.BEGINNER,
        riskTolerance: RiskTolerance.CONSERVATIVE,
        investmentKnowledge: []
      },
      goals: {
        primaryGoals: ['retirement'],
        timeHorizon: TimeHorizon.LONG_TERM,
        specificGoalAmounts: {}
      },
      currentSituation: {
        existingInvestments: 25000,
        monthlySavings: 500,
        emergencyFund: 5000,
        currentDebt: 0
      }
    }

    const profile = await storageService.createProfile(profileData)
    
    // Retrieve and verify
    const retrievedProfile = await storageService.getProfile()
    expect(retrievedProfile).not.toBeNull()
    expect(retrievedProfile!.personalInfo.name).toBe('Persistence Test')
    expect(retrievedProfile!.id).toBe(profile.id)

    // Update profile
    const updateData = {
      id: profile.id,
      age: 31,
      riskTolerance: RiskTolerance.MODERATE
    }

    const updatedProfile = await storageService.updateProfile(updateData)
    expect(updatedProfile.age).toBe(31)
    expect(updatedProfile.riskTolerance).toBe(RiskTolerance.MODERATE)
    expect(updatedProfile.personalInfo.name).toBe('Persistence Test') // Should remain unchanged
  })

  it('should validate data integrity', async () => {
    // Test invalid holding data
    try {
      await storageService.createHolding({
        symbol: '',
        securityType: SecurityType.STOCK,
        quantity: -5, // Invalid quantity
        purchasePrice: 100,
        purchaseDate: new Date()
      })
      expect.fail('Should have thrown an error for invalid quantity')
    } catch (error) {
      expect(error).toBeDefined()
    }

    // Test valid holding
    const validHolding = await storageService.createHolding({
      symbol: 'TEST',
      securityType: SecurityType.STOCK,
      quantity: 10,
      purchasePrice: 50,
      purchaseDate: new Date()
    })

    expect(validHolding.symbol).toBe('TEST')
    expect(validHolding.quantity).toBe(10)
  })
})
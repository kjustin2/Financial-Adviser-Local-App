import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { UserProfile } from '../types/profile'
import { Recommendation } from '../types/recommendations'
import { ExperienceLevel, RiskTolerance, TimeHorizon, RecommendationType, RecommendationPriority } from '../types/enums'

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Mock user profile data for testing
export const mockUserProfile: UserProfile = {
  id: 'test-user-1',
  personalInfo: {
    name: 'John Doe',
    age: 35,
    incomeRange: '$50,000 - $75,000'
  },
  investmentProfile: {
    experienceLevel: ExperienceLevel.INTERMEDIATE,
    riskTolerance: RiskTolerance.MODERATE,
    riskScore: 6,
    investmentKnowledge: ['stocks', 'bonds', 'etfs']
  },
  goals: {
    primaryGoals: ['retirement', 'emergency_fund'],
    timeHorizon: TimeHorizon.LONG_TERM,
    targetRetirementAge: 65,
    specificGoalAmounts: {
      retirement: 1000000,
      emergency_fund: 30000
    }
  },
  currentSituation: {
    existingInvestments: 25000,
    monthlySavings: 1000,
    emergencyFund: 10000,
    currentDebt: 5000
  },
  preferences: {
    communicationStyle: 'detailed',
    updateFrequency: 'weekly'
  },
  onboardingCompleted: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  // Legacy fields for backward compatibility
  name: 'John Doe',
  age: 35,
  incomeRange: '$50,000 - $75,000',
  experienceLevel: ExperienceLevel.INTERMEDIATE,
  riskTolerance: RiskTolerance.MODERATE,
  financialGoals: ['retirement', 'emergency_fund'],
  timeHorizon: TimeHorizon.LONG_TERM,
  majorPurchases: []
}

// Mock recommendation data
export const mockRecommendations: Recommendation[] = [
  {
    id: 'rec-1',
    userId: 'test-user-1',
    type: RecommendationType.ALLOCATION,
    priority: RecommendationPriority.HIGH,
    title: 'Increase International Diversification',
    description: 'Add international stocks to reduce portfolio risk',
    rationale: 'Your portfolio is heavily concentrated in US stocks',
    actionItems: [
      { id: 'action-1', description: 'Research international index funds', completed: false }
    ],
    expectedImpact: {
      riskReduction: 15,
      returnImprovement: 5
    },
    implementationDifficulty: 'easy',
    status: 'pending',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    // Legacy fields for backward compatibility
    reasoning: 'Your portfolio is heavily concentrated in US stocks',
    implemented: false
  }
]

// Mock portfolio holdings
export const mockHoldings = [
  {
    id: 'holding-1',
    symbol: 'VTI',
    name: 'Vanguard Total Stock Market ETF',
    shares: 100,
    currentPrice: 220.50,
    purchasePrice: 200.00,
    purchaseDate: new Date('2023-01-01'),
    assetClass: 'stocks',
    region: 'us'
  }
]

// Utility functions for testing
export const waitForLoadingToFinish = () => {
  return new Promise<void>(resolve => setTimeout(resolve, 0))
}

// Factory functions for creating test data with overrides
export const createMockUserProfile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  ...mockUserProfile,
  ...overrides,
  personalInfo: { ...mockUserProfile.personalInfo, ...overrides.personalInfo },
  investmentProfile: { ...mockUserProfile.investmentProfile, ...overrides.investmentProfile },
  goals: { ...mockUserProfile.goals, ...overrides.goals },
  currentSituation: { ...mockUserProfile.currentSituation, ...overrides.currentSituation },
  preferences: { ...mockUserProfile.preferences, ...overrides.preferences }
})

export const createMockRecommendation = (overrides: Partial<Recommendation> = {}): Recommendation => ({
  ...mockRecommendations[0],
  id: `rec-${Date.now()}`, // Ensure unique IDs
  ...overrides,
  actionItems: overrides.actionItems || mockRecommendations[0].actionItems,
  expectedImpact: { ...mockRecommendations[0].expectedImpact, ...overrides.expectedImpact }
})

// Mock localStorage
export const mockLocalStorage = () => {
  const store: Record<string, string> = {}
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    })
  }
}

// Mock IndexedDB operations
export const mockIndexedDB = {
  profiles: {
    get: vi.fn(),
    add: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  },
  holdings: {
    toArray: vi.fn(),
    add: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  },
  goals: {
    toArray: vi.fn(),
    add: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}

// Test data generators for different scenarios
export const createIncompleteProfile = (): Partial<UserProfile> => ({
  id: 'incomplete-user',
  personalInfo: {
    name: 'Jane Doe',
    age: 28,
    incomeRange: '$30,000 - $50,000'
  },
  onboardingCompleted: false,
  createdAt: new Date(),
  updatedAt: new Date()
})

export const createHighRiskProfile = (): UserProfile => 
  createMockUserProfile({
    investmentProfile: {
      ...mockUserProfile.investmentProfile,
      experienceLevel: ExperienceLevel.ADVANCED,
      riskTolerance: RiskTolerance.AGGRESSIVE,
      riskScore: 9
    }
  })

export const createConservativeProfile = (): UserProfile => 
  createMockUserProfile({
    investmentProfile: {
      ...mockUserProfile.investmentProfile,
      experienceLevel: ExperienceLevel.BEGINNER,
      riskTolerance: RiskTolerance.CONSERVATIVE,
      riskScore: 3
    }
  })

// Test assertion helpers
export const expectProfileToBeComplete = (profile: UserProfile) => {
  expect(profile.onboardingCompleted).toBe(true)
  expect(profile.personalInfo.name).toBeTruthy()
  expect(profile.personalInfo.age).toBeGreaterThan(0)
  expect(profile.investmentProfile.experienceLevel).toBeTruthy()
  expect(profile.investmentProfile.riskTolerance).toBeTruthy()
  expect(profile.goals.primaryGoals.length).toBeGreaterThan(0)
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { customRender as render }
import { ExperienceLevel, RiskTolerance, TimeHorizon, MajorPurchase } from './enums'

export interface UserProfile {
  id: string
  personalInfo: {
    name: string
    age: number
    incomeRange: string
  }
  investmentProfile: {
    experienceLevel: ExperienceLevel
    riskTolerance: RiskTolerance
    riskScore: number // calculated score 1-10
    investmentKnowledge: string[]
  }
  goals: {
    primaryGoals: string[]
    timeHorizon: TimeHorizon
    targetRetirementAge?: number
    specificGoalAmounts: Record<string, number>
  }
  currentSituation: {
    existingInvestments: number
    monthlySavings: number
    emergencyFund: number
    currentDebt: number
  }
  preferences: {
    communicationStyle: 'detailed' | 'concise'
    updateFrequency: 'daily' | 'weekly' | 'monthly'
  }
  onboardingCompleted: boolean
  createdAt: Date
  updatedAt: Date
  
  // Legacy fields for backward compatibility
  name: string
  age: number
  incomeRange: string
  experienceLevel: ExperienceLevel
  riskTolerance: RiskTolerance
  financialGoals: string[]
  timeHorizon: TimeHorizon
  majorPurchases: MajorPurchase[]
}

export interface CreateUserProfileData {
  personalInfo: {
    name: string
    age: number
    incomeRange: string
  }
  investmentProfile: {
    experienceLevel: ExperienceLevel
    riskTolerance: RiskTolerance
    investmentKnowledge?: string[]
  }
  goals: {
    primaryGoals: string[]
    timeHorizon: TimeHorizon
    targetRetirementAge?: number
    specificGoalAmounts?: Record<string, number>
  }
  currentSituation: {
    existingInvestments: number
    monthlySavings: number
    emergencyFund: number
    currentDebt?: number
  }
  preferences?: {
    communicationStyle?: 'detailed' | 'concise'
    updateFrequency?: 'daily' | 'weekly' | 'monthly'
  }
}

export interface UpdateUserProfileData extends Partial<CreateUserProfileData> {
  id: string
}

// Helper type for onboarding data conversion
export interface OnboardingProfileData {
  name: string
  age: number
  incomeRange: string
  experienceLevel: ExperienceLevel
  riskTolerance: RiskTolerance
  investmentKnowledge?: string[]
  primaryGoals: string[]
  timeHorizon: TimeHorizon
  targetRetirementAge?: number
  specificGoalAmounts?: Record<string, number>
  existingInvestments: number
  monthlySavings: number
  emergencyFund: number
  currentDebt?: number
}
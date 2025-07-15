import { ExperienceLevel, RiskTolerance, TimeHorizon, MajorPurchase } from './enums'

export interface UserProfile {
  id: string
  name: string
  age: number
  incomeRange: string
  experienceLevel: ExperienceLevel
  riskTolerance: RiskTolerance
  financialGoals: string[]
  timeHorizon: TimeHorizon
  majorPurchases: MajorPurchase[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserProfileData {
  name: string
  age: number
  incomeRange: string
  experienceLevel: ExperienceLevel
  riskTolerance: RiskTolerance
  financialGoals: string[]
  timeHorizon: TimeHorizon
  majorPurchases: MajorPurchase[]
}

export interface UpdateUserProfileData extends Partial<CreateUserProfileData> {
  id: string
}
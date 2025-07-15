import { z } from 'zod'
import {
  ExperienceLevel,
  RiskTolerance,
  TimeHorizon,
  MajorPurchase,
  SecurityType,
  GoalCategory,
  GoalPriority,
  RecommendationType,
  RecommendationPriority
} from '../types/enums'

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  age: z.number().int().min(18, 'Must be at least 18').max(120, 'Invalid age'),
  incomeRange: z.string().min(1, 'Income range is required'),
  experienceLevel: z.nativeEnum(ExperienceLevel),
  riskTolerance: z.nativeEnum(RiskTolerance),
  financialGoals: z.array(z.string()).min(1, 'At least one financial goal required'),
  timeHorizon: z.nativeEnum(TimeHorizon),
  majorPurchases: z.array(z.nativeEnum(MajorPurchase)),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const CreateUserProfileSchema = UserProfileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export const HoldingSchema = z.object({
  id: z.string().uuid(),
  symbol: z.string().min(1, 'Symbol is required').max(20, 'Symbol too long'),
  securityName: z.string().max(255, 'Security name too long').optional(),
  securityType: z.nativeEnum(SecurityType),
  quantity: z.number().positive('Quantity must be positive'),
  purchasePrice: z.number().positive('Purchase price must be positive'),
  purchaseDate: z.date(),
  currentPrice: z.number().positive('Current price must be positive').optional(),
  lastUpdated: z.date()
})

export const CreateHoldingSchema = HoldingSchema.omit({
  id: true,
  lastUpdated: true
})

export const GoalSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Goal name is required').max(255, 'Goal name too long'),
  category: z.nativeEnum(GoalCategory),
  targetAmount: z.number().positive('Target amount must be positive'),
  targetDate: z.date().refine(date => date > new Date(), 'Target date must be in the future'),
  currentAmount: z.number().min(0, 'Current amount cannot be negative').default(0),
  priority: z.nativeEnum(GoalPriority),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const CreateGoalSchema = GoalSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export const RecommendationSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(RecommendationType),
  priority: z.nativeEnum(RecommendationPriority),
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().min(1, 'Description is required'),
  reasoning: z.string().min(1, 'Reasoning is required'),
  actionItems: z.array(z.string()).min(1, 'At least one action item required'),
  implemented: z.boolean().default(false),
  createdAt: z.date(),
  implementedAt: z.date().optional()
})

export const CreateRecommendationSchema = RecommendationSchema.omit({
  id: true,
  implemented: true,
  createdAt: true,
  implementedAt: true
})

export const AppSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  currency: z.string().default('USD'),
  dateFormat: z.string().default('MM/dd/yyyy'),
  autoRefreshInterval: z.number().min(0).default(300000), // 5 minutes
  privacyMode: z.boolean().default(false),
  notifications: z.object({
    goalReminders: z.boolean().default(true),
    portfolioAlerts: z.boolean().default(true),
    recommendationUpdates: z.boolean().default(true)
  }).default({})
})

export type ValidatedUserProfile = z.infer<typeof UserProfileSchema>
export type ValidatedHolding = z.infer<typeof HoldingSchema>
export type ValidatedGoal = z.infer<typeof GoalSchema>
export type ValidatedRecommendation = z.infer<typeof RecommendationSchema>
export type ValidatedAppSettings = z.infer<typeof AppSettingsSchema>
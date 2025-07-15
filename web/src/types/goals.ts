import { GoalCategory, GoalPriority } from './enums'

export interface Goal {
  id: string
  name: string
  category: GoalCategory
  targetAmount: number
  targetDate: Date
  currentAmount: number
  priority: GoalPriority
  createdAt: Date
  updatedAt: Date
}

export interface CreateGoalData {
  name: string
  category: GoalCategory
  targetAmount: number
  targetDate: Date
  currentAmount?: number
  priority: GoalPriority
}

export interface UpdateGoalData extends Partial<CreateGoalData> {
  id: string
}

export interface GoalCalculations {
  progressPercentage: number
  remainingAmount: number
  daysRemaining: number
  monthlyRequiredSavings: number
  isNearCompletion: boolean
  isOverdue: boolean
}

export interface GoalProgress {
  goal: Goal
  calculations: GoalCalculations
}

export interface GoalAnalysis {
  totalGoals: number
  completedGoals: number
  totalTargetAmount: number
  totalCurrentAmount: number
  averageProgress: number
  urgentGoals: Goal[]
  nearCompletionGoals: Goal[]
}
import { RecommendationType, RecommendationPriority } from './enums'

export interface ActionItem {
  id: string
  description: string
  completed: boolean
  completedAt?: Date
}

export interface Recommendation {
  id: string
  userId: string
  type: RecommendationType
  priority: RecommendationPriority
  title: string
  description: string
  rationale: string
  actionItems: ActionItem[]
  expectedImpact: {
    riskReduction?: number
    returnImprovement?: number
    goalAcceleration?: number
  }
  implementationDifficulty: 'easy' | 'moderate' | 'complex'
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed'
  createdAt: Date
  updatedAt: Date
  
  // Legacy fields for backward compatibility
  reasoning: string
  implemented: boolean
  implementedAt?: Date
}

export interface CreateRecommendationData {
  type: RecommendationType
  priority: RecommendationPriority
  title: string
  description: string
  reasoning: string
  actionItems: string[]
}

export interface UpdateRecommendationData extends Partial<CreateRecommendationData> {
  id: string
  implemented?: boolean
  implementedAt?: Date
}

export interface RecommendationAnalysis {
  totalRecommendations: number
  implementedRecommendations: number
  pendingRecommendations: number
  highPriorityRecommendations: number
  recentRecommendations: Recommendation[]
  recommendationsByType: Record<RecommendationType, number>
}
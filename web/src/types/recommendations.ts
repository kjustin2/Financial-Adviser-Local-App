import { RecommendationType, RecommendationPriority } from './enums'

export interface Recommendation {
  id: string
  type: RecommendationType
  priority: RecommendationPriority
  title: string
  description: string
  reasoning: string
  actionItems: string[]
  implemented: boolean
  createdAt: Date
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
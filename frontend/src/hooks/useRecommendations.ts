import { useQuery } from '@tanstack/react-query'
import { apiService } from '@/services/api'

export interface Recommendation {
  type: string
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  action: string
  reason: string
  portfolio_id?: number
  goal_id?: number
  target_allocation?: Record<string, number>
  estimated_impact?: string
}

export interface RecommendationListResponse {
  recommendations: Recommendation[]
  total_count: number
  high_priority_count: number
  medium_priority_count: number
  low_priority_count: number
}

export interface RecommendationSummary {
  overall_portfolio_health: string
  key_insights: string[]
  next_steps: string[]
  risk_assessment: string
}

export function useRecommendations() {
  return useQuery({
    queryKey: ['recommendations'],
    queryFn: async (): Promise<RecommendationListResponse> => {
      const response = await apiService.get('/api/v1/recommendations/')
      return response
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useRecommendationSummary() {
  return useQuery({
    queryKey: ['recommendations', 'summary'],
    queryFn: async (): Promise<RecommendationSummary> => {
      const response = await apiService.get('/api/v1/recommendations/summary')
      return response
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}
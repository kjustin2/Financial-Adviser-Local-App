import { useQuery } from '@tanstack/react-query'
import { apiService } from '@/services/api'

export interface Goal {
  id: number
  name: string
  description?: string
  goal_type: string
  target_amount: number
  current_amount: number
  target_date: string
  progress_percentage: number
}

export interface GoalListResponse {
  goals: Goal[]
  total_goals: number
  average_progress: number
}

export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: async (): Promise<GoalListResponse> => {
      const response = await apiService.get('/api/v1/goals/')
      return response
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useGoal(id: number) {
  return useQuery({
    queryKey: ['goal', id],
    queryFn: async (): Promise<Goal> => {
      const response = await apiService.get(`/api/v1/goals/${id}`)
      return response
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}
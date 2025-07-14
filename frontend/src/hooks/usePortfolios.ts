import { useQuery } from '@tanstack/react-query'
import { apiService } from '@/services/api'

export interface Portfolio {
  id: number
  name: string
  portfolio_type: string
  current_value: number
  total_cost_basis: number
  unrealized_gain_loss: number
  unrealized_return_percent: number | null
}

export interface PortfolioListResponse {
  portfolios: Portfolio[]
  total_value: number
  total_gain_loss: number
  total_return_percent: number | null
  portfolios_count: number
}

export function usePortfolios() {
  return useQuery({
    queryKey: ['portfolios'],
    queryFn: async (): Promise<PortfolioListResponse> => {
      const response = await apiService.get('/api/v1/portfolios/')
      return response
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function usePortfolio(id: number) {
  return useQuery({
    queryKey: ['portfolio', id],
    queryFn: async (): Promise<Portfolio> => {
      const response = await apiService.get(`/api/v1/portfolios/${id}`)
      return response
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}
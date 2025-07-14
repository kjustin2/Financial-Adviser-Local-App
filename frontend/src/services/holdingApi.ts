import { api } from './api'
import type { 
  Holding, 
  HoldingCreate, 
  HoldingUpdate, 
  HoldingListResponse,
  HoldingPerformance 
} from '@/types/holding'

export const holdingApi = {
  // Get holdings with optional portfolio filter
  getHoldings: async (
    portfolioId?: number, 
    skip = 0, 
    limit = 100
  ): Promise<HoldingListResponse> => {
    const params = new URLSearchParams()
    
    if (portfolioId) params.append('portfolio_id', portfolioId.toString())
    params.append('skip', skip.toString())
    params.append('limit', limit.toString())
    
    const queryString = params.toString()
    const url = `/holdings/?${queryString}`
    
    const response = await api.get<HoldingListResponse>(url)
    return response.data
  },

  // Get a specific holding
  getHolding: async (holdingId: number): Promise<Holding> => {
    const response = await api.get<Holding>(`/holdings/${holdingId}`)
    return response.data
  },

  // Create a new holding
  createHolding: async (holdingData: HoldingCreate): Promise<Holding> => {
    const response = await api.post<Holding>('/holdings/', holdingData)
    return response.data
  },

  // Update a holding
  updateHolding: async (
    holdingId: number, 
    holdingData: HoldingUpdate
  ): Promise<Holding> => {
    const response = await api.put<Holding>(`/holdings/${holdingId}`, holdingData)
    return response.data
  },

  // Delete a holding
  deleteHolding: async (holdingId: number): Promise<void> => {
    await api.delete(`/holdings/${holdingId}`)
  },

  // Get holding performance metrics
  getHoldingPerformance: async (holdingId: number): Promise<HoldingPerformance> => {
    const response = await api.get<HoldingPerformance>(`/holdings/${holdingId}/performance`)
    return response.data
  },

  // Update holding price
  updateHoldingPrice: async (
    holdingId: number, 
    priceData: {
      symbol: string
      current_price: number
      change_amount?: number
      change_percent?: number
    }
  ): Promise<Holding> => {
    const response = await api.put<Holding>(`/holdings/${holdingId}/price`, priceData)
    return response.data
  },

  // Create multiple holdings at once
  createBulkHoldings: async (
    portfolioId: number, 
    holdings: HoldingCreate[]
  ): Promise<Holding[]> => {
    const bulkData = {
      portfolio_id: portfolioId,
      holdings: holdings.map(h => ({
        symbol: h.symbol,
        security_name: h.security_name,
        security_type: h.security_type,
        quantity: h.quantity,
        cost_basis: h.cost_basis,
        purchase_date: h.purchase_date,
        sector: h.sector,
        asset_class: h.asset_class
      }))
    }
    
    const response = await api.post<Holding[]>('/holdings/bulk', bulkData)
    return response.data
  },

  // Get portfolio holdings
  getPortfolioHoldings: async (portfolioId: number): Promise<HoldingListResponse> => {
    return holdingApi.getHoldings(portfolioId)
  }
}
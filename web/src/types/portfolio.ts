import { SecurityType } from './enums'

export interface Holding {
  id: string
  symbol: string
  securityName?: string
  securityType: SecurityType
  quantity: number
  purchasePrice: number
  purchaseDate: Date
  currentPrice?: number
  lastUpdated: Date
}

export interface CreateHoldingData {
  symbol: string
  securityName?: string
  securityType: SecurityType
  quantity: number
  purchasePrice: number
  purchaseDate: Date
  currentPrice?: number
}

export interface UpdateHoldingData extends Partial<CreateHoldingData> {
  id: string
}

export interface HoldingCalculations {
  totalCostBasis: number
  currentValue: number
  unrealizedGainLoss: number
  unrealizedGainLossPercent: number
  isProfitable: boolean
}

export interface PortfolioSummary {
  totalValue: number
  totalCostBasis: number
  totalGainLoss: number
  totalGainLossPercent: number
  holdingsCount: number
  lastUpdated: Date
}

export interface AllocationBreakdown {
  securityType: SecurityType
  value: number
  percentage: number
  count: number
}

export interface PortfolioAnalysis {
  summary: PortfolioSummary
  allocations: AllocationBreakdown[]
  topPerformers: Holding[]
  worstPerformers: Holding[]
  riskMetrics: RiskMetrics
}

export interface RiskMetrics {
  diversificationScore: number
  concentrationRisk: number
  volatilityScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
}
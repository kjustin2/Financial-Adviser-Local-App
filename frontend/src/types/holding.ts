export type SecurityType = 
  | 'stock'
  | 'bond'
  | 'etf'
  | 'mutual_fund'
  | 'cash'
  | 'crypto'
  | 'other'

export type AssetClass = 
  | 'equity'
  | 'fixed_income'
  | 'cash'
  | 'alternative'
  | 'commodity'

export interface Holding {
  id: number
  portfolio_id: number
  symbol: string
  security_name?: string
  security_type: SecurityType
  quantity: number
  cost_basis: number
  purchase_date: string
  current_price?: number
  last_price_update?: string
  sector?: string
  asset_class?: AssetClass
  is_active: boolean
  created_at: string
  updated_at: string
  
  // Computed properties
  total_cost_basis: number
  current_value: number
  unrealized_gain_loss: number
  unrealized_gain_loss_percent: number
  day_change?: number
  day_change_percent?: number
}

export interface HoldingCreate {
  portfolio_id: number
  symbol: string
  security_name?: string
  security_type: SecurityType
  quantity: number
  cost_basis: number
  purchase_date: string
  sector?: string
  asset_class?: AssetClass
}

export interface HoldingUpdate {
  security_name?: string
  security_type?: SecurityType
  quantity?: number
  cost_basis?: number
  current_price?: number
}

export interface HoldingSummary {
  id: number
  symbol: string
  security_name?: string
  security_type: SecurityType
  quantity: number
  current_value: number
  unrealized_gain_loss: number
  unrealized_gain_loss_percent: number
  weight_in_portfolio?: number
}

export interface HoldingListResponse {
  holdings: HoldingSummary[]
  total_count: number
  total_value: number
  total_cost_basis: number
  total_unrealized_gain_loss: number
}

export interface HoldingPerformance {
  holding_id: number
  symbol: string
  current_value: number
  cost_basis: number
  unrealized_gain_loss: number
  unrealized_gain_loss_percent: number
  weight_in_portfolio: number
}
export type TransactionType = 
  | 'buy'
  | 'sell'
  | 'dividend'
  | 'distribution'
  | 'transfer_in'
  | 'transfer_out'
  | 'split'
  | 'merger'
  | 'spinoff'

export interface Transaction {
  id: number
  portfolio_id: number
  type: TransactionType
  symbol: string
  security_name?: string
  quantity?: number
  price?: number
  total_amount: number
  fees: number
  transaction_date: string
  trade_date?: string
  settlement_date?: string
  notes?: string
  external_transaction_id?: string
  tax_lot_id?: string
  wash_sale?: number
  from_portfolio_id?: number
  to_portfolio_id?: number
  created_at: string
  updated_at: string
  is_active: boolean
  
  // Computed properties
  net_amount: number
  effective_price?: number
  is_buy_transaction: boolean
  is_sell_transaction: boolean
  is_income_transaction: boolean
}

export interface TransactionCreate {
  portfolio_id: number
  type: TransactionType
  symbol: string
  security_name?: string
  quantity?: number
  price?: number
  total_amount: number
  fees?: number
  transaction_date: string
  trade_date?: string
  settlement_date?: string
  notes?: string
  external_transaction_id?: string
  tax_lot_id?: string
  wash_sale?: number
  from_portfolio_id?: number
  to_portfolio_id?: number
}

export interface TransactionUpdate {
  type?: TransactionType
  symbol?: string
  security_name?: string
  quantity?: number
  price?: number
  total_amount?: number
  fees?: number
  transaction_date?: string
  trade_date?: string
  settlement_date?: string
  notes?: string
  external_transaction_id?: string
  tax_lot_id?: string
  wash_sale?: number
}

export interface TransactionListResponse {
  transactions: Transaction[]
  total_count: number
  page: number
  page_size: number
  has_next: boolean
  has_previous: boolean
}

export interface TransactionFilters {
  portfolio_id?: number
  transaction_type?: TransactionType
  symbol?: string
  start_date?: string
  end_date?: string
  skip?: number
  limit?: number
}
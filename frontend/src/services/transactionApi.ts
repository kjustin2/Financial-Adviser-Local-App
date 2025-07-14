import { api } from './api'
import type { 
  Transaction, 
  TransactionCreate, 
  TransactionUpdate, 
  TransactionListResponse,
  TransactionFilters 
} from '@/types/transaction'

export const transactionApi = {
  // Get transactions with optional filtering
  getTransactions: async (filters?: TransactionFilters): Promise<TransactionListResponse> => {
    const params = new URLSearchParams()
    
    if (filters?.portfolio_id) params.append('portfolio_id', filters.portfolio_id.toString())
    if (filters?.transaction_type) params.append('transaction_type', filters.transaction_type)
    if (filters?.symbol) params.append('symbol', filters.symbol)
    if (filters?.start_date) params.append('start_date', filters.start_date)
    if (filters?.end_date) params.append('end_date', filters.end_date)
    if (filters?.skip) params.append('skip', filters.skip.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    
    const queryString = params.toString()
    const url = queryString ? `/transactions/?${queryString}` : '/transactions/'
    
    const response = await api.get<TransactionListResponse>(url)
    return response.data
  },

  // Get a specific transaction
  getTransaction: async (transactionId: number): Promise<Transaction> => {
    const response = await api.get<Transaction>(`/transactions/${transactionId}`)
    return response.data
  },

  // Create a new transaction
  createTransaction: async (transactionData: TransactionCreate): Promise<Transaction> => {
    const response = await api.post<Transaction>('/transactions/', transactionData)
    return response.data
  },

  // Update a transaction
  updateTransaction: async (
    transactionId: number, 
    transactionData: TransactionUpdate
  ): Promise<Transaction> => {
    const response = await api.put<Transaction>(`/transactions/${transactionId}`, transactionData)
    return response.data
  },

  // Delete a transaction
  deleteTransaction: async (transactionId: number): Promise<void> => {
    await api.delete(`/transactions/${transactionId}`)
  },

  // Get transactions for a specific portfolio
  getPortfolioTransactions: async (
    portfolioId: number, 
    skip = 0, 
    limit = 50
  ): Promise<TransactionListResponse> => {
    return transactionApi.getTransactions({
      portfolio_id: portfolioId,
      skip,
      limit
    })
  },

  // Get recent transactions (last 30 days)
  getRecentTransactions: async (limit = 10): Promise<TransactionListResponse> => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    return transactionApi.getTransactions({
      start_date: thirtyDaysAgo.toISOString().split('T')[0],
      limit
    })
  },

  // Get transactions by symbol
  getSymbolTransactions: async (
    symbol: string, 
    portfolioId?: number
  ): Promise<TransactionListResponse> => {
    return transactionApi.getTransactions({
      symbol,
      portfolio_id: portfolioId
    })
  }
}
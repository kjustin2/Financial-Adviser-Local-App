import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storageService } from '../services/storage'
import type { Holding, CreateHoldingData, UpdateHoldingData } from '../types'

interface PortfolioState {
  holdings: Holding[]
  isLoading: boolean
  error: string | null
}

interface PortfolioActions {
  loadHoldings: () => Promise<void>
  addHolding: (data: CreateHoldingData) => Promise<void>
  updateHolding: (data: UpdateHoldingData) => Promise<void>
  deleteHolding: (id: string) => Promise<void>
  clearHoldings: () => Promise<void>
  refreshHolding: (id: string, currentPrice: number) => Promise<void>
  clearError: () => void
}

export const usePortfolioStore = create<PortfolioState & PortfolioActions>()(
  persist(
    (set, get) => ({
      // State
      holdings: [],
      isLoading: false,
      error: null,

      // Actions
      loadHoldings: async () => {
        set({ isLoading: true, error: null })
        try {
          const holdings = await storageService.getHoldings()
          set({ holdings, isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load holdings',
            isLoading: false 
          })
        }
      },

      addHolding: async (data: CreateHoldingData) => {
        set({ isLoading: true, error: null })
        try {
          const newHolding = await storageService.createHolding(data)
          const { holdings } = get()
          set({ 
            holdings: [...holdings, newHolding].sort((a, b) => a.symbol.localeCompare(b.symbol)),
            isLoading: false 
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add holding',
            isLoading: false 
          })
          throw error
        }
      },

      updateHolding: async (data: UpdateHoldingData) => {
        set({ isLoading: true, error: null })
        try {
          const updatedHolding = await storageService.updateHolding(data)
          const { holdings } = get()
          const updatedHoldings = holdings.map(h => 
            h.id === data.id ? updatedHolding : h
          )
          set({ holdings: updatedHoldings, isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update holding',
            isLoading: false 
          })
          throw error
        }
      },

      deleteHolding: async (id: string) => {
        set({ isLoading: true, error: null })
        try {
          await storageService.deleteHolding(id)
          const { holdings } = get()
          set({ 
            holdings: holdings.filter(h => h.id !== id),
            isLoading: false 
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete holding',
            isLoading: false 
          })
          throw error
        }
      },

      clearHoldings: async () => {
        set({ isLoading: true, error: null })
        try {
          await storageService.deleteAllHoldings()
          set({ holdings: [], isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to clear holdings',
            isLoading: false 
          })
          throw error
        }
      },

      refreshHolding: async (id: string, currentPrice: number) => {
        try {
          const updateData: UpdateHoldingData = { id, currentPrice }
          await get().updateHolding(updateData)
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to refresh holding price'
          })
          throw error
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'portfolio-storage',
      partialize: (state) => ({ holdings: state.holdings })
    }
  )
)
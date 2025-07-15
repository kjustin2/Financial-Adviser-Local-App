import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storageService } from '../services/storage'
import type { Recommendation, CreateRecommendationData, UpdateRecommendationData } from '../types'

interface RecommendationsState {
  recommendations: Recommendation[]
  isLoading: boolean
  error: string | null
}

interface RecommendationsActions {
  loadRecommendations: () => Promise<void>
  addRecommendation: (data: CreateRecommendationData) => Promise<void>
  updateRecommendation: (data: UpdateRecommendationData) => Promise<void>
  markImplemented: (id: string) => Promise<void>
  deleteRecommendation: (id: string) => Promise<void>
  clearRecommendations: () => Promise<void>
  clearError: () => void
}

export const useRecommendationsStore = create<RecommendationsState & RecommendationsActions>()(
  persist(
    (set, get) => ({
      // State
      recommendations: [],
      isLoading: false,
      error: null,

      // Actions
      loadRecommendations: async () => {
        set({ isLoading: true, error: null })
        try {
          const recommendations = await storageService.getRecommendations()
          set({ recommendations, isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load recommendations',
            isLoading: false 
          })
        }
      },

      addRecommendation: async (data: CreateRecommendationData) => {
        set({ isLoading: true, error: null })
        try {
          const newRecommendation = await storageService.createRecommendation(data)
          const { recommendations } = get()
          set({ 
            recommendations: [newRecommendation, ...recommendations],
            isLoading: false 
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add recommendation',
            isLoading: false 
          })
          throw error
        }
      },

      updateRecommendation: async (data: UpdateRecommendationData) => {
        set({ isLoading: true, error: null })
        try {
          const updatedRecommendation = await storageService.updateRecommendation(data)
          const { recommendations } = get()
          const updatedRecommendations = recommendations.map(r => 
            r.id === data.id ? updatedRecommendation : r
          )
          set({ recommendations: updatedRecommendations, isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update recommendation',
            isLoading: false 
          })
          throw error
        }
      },

      markImplemented: async (id: string) => {
        set({ isLoading: true, error: null })
        try {
          const updatedRecommendation = await storageService.markRecommendationImplemented(id)
          const { recommendations } = get()
          const updatedRecommendations = recommendations.map(r => 
            r.id === id ? updatedRecommendation : r
          )
          set({ recommendations: updatedRecommendations, isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to mark recommendation as implemented',
            isLoading: false 
          })
          throw error
        }
      },

      deleteRecommendation: async (id: string) => {
        set({ isLoading: true, error: null })
        try {
          await storageService.deleteRecommendation(id)
          const { recommendations } = get()
          set({ 
            recommendations: recommendations.filter(r => r.id !== id),
            isLoading: false 
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete recommendation',
            isLoading: false 
          })
          throw error
        }
      },

      clearRecommendations: async () => {
        set({ isLoading: true, error: null })
        try {
          await storageService.clearRecommendations()
          set({ recommendations: [], isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to clear recommendations',
            isLoading: false 
          })
          throw error
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'recommendations-storage',
      partialize: (state) => ({ recommendations: state.recommendations })
    }
  )
)
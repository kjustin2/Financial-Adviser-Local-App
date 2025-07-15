import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storageService } from '../services/storage'
import type { Goal, CreateGoalData, UpdateGoalData } from '../types'

interface GoalsState {
  goals: Goal[]
  isLoading: boolean
  error: string | null
}

interface GoalsActions {
  loadGoals: () => Promise<void>
  addGoal: (data: CreateGoalData) => Promise<void>
  updateGoal: (data: UpdateGoalData) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  updateGoalProgress: (id: string, amount: number) => Promise<void>
  clearError: () => void
}

export const useGoalsStore = create<GoalsState & GoalsActions>()(
  persist(
    (set, get) => ({
      // State
      goals: [],
      isLoading: false,
      error: null,

      // Actions
      loadGoals: async () => {
        set({ isLoading: true, error: null })
        try {
          const goals = await storageService.getGoals()
          set({ goals, isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load goals',
            isLoading: false 
          })
        }
      },

      addGoal: async (data: CreateGoalData) => {
        set({ isLoading: true, error: null })
        try {
          const newGoal = await storageService.createGoal(data)
          const { goals } = get()
          set({ 
            goals: [...goals, newGoal].sort((a, b) => 
              new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
            ),
            isLoading: false 
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add goal',
            isLoading: false 
          })
          throw error
        }
      },

      updateGoal: async (data: UpdateGoalData) => {
        set({ isLoading: true, error: null })
        try {
          const updatedGoal = await storageService.updateGoal(data)
          const { goals } = get()
          const updatedGoals = goals.map(g => 
            g.id === data.id ? updatedGoal : g
          )
          set({ goals: updatedGoals, isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update goal',
            isLoading: false 
          })
          throw error
        }
      },

      deleteGoal: async (id: string) => {
        set({ isLoading: true, error: null })
        try {
          await storageService.deleteGoal(id)
          const { goals } = get()
          set({ 
            goals: goals.filter(g => g.id !== id),
            isLoading: false 
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete goal',
            isLoading: false 
          })
          throw error
        }
      },

      updateGoalProgress: async (id: string, amount: number) => {
        try {
          const updateData: UpdateGoalData = { id, currentAmount: amount }
          await get().updateGoal(updateData)
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update goal progress'
          })
          throw error
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'goals-storage',
      partialize: (state) => ({ goals: state.goals })
    }
  )
)
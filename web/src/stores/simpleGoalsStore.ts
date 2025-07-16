import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SimpleGoal, CreateGoalData } from '../types/simple'

interface GoalsState {
  goals: SimpleGoal[]
  isLoading: boolean
  error: string | null
  
  // Actions
  addGoal: (userId: string, data: CreateGoalData) => Promise<void>
  updateGoal: (goalId: string, updates: Partial<SimpleGoal>) => Promise<void>
  deleteGoal: (goalId: string) => Promise<void>
  getGoalsByUser: (userId: string) => SimpleGoal[]
  updateGoalProgress: (goalId: string, currentAmount: number) => Promise<void>
}

export const useSimpleGoalsStore = create<GoalsState>()(
  persist(
    (set, get) => ({
      goals: [],
      isLoading: false,
      error: null,

      addGoal: async (userId: string, data: CreateGoalData) => {
        set({ isLoading: true, error: null })
        try {
          const goal: SimpleGoal = {
            id: crypto.randomUUID(),
            userId,
            ...data,
            currentAmount: data.currentAmount || 0,
            createdAt: new Date(),
          }
          set(state => ({ 
            goals: [...state.goals, goal], 
            isLoading: false 
          }))
        } catch (error) {
          set({ error: 'Failed to add goal', isLoading: false })
          throw error
        }
      },

      updateGoal: async (goalId: string, updates: Partial<SimpleGoal>) => {
        set({ isLoading: true, error: null })
        try {
          set(state => ({
            goals: state.goals.map(goal =>
              goal.id === goalId ? { ...goal, ...updates } : goal
            ),
            isLoading: false
          }))
        } catch (error) {
          set({ error: 'Failed to update goal', isLoading: false })
          throw error
        }
      },

      deleteGoal: async (goalId: string) => {
        set({ isLoading: true, error: null })
        try {
          set(state => ({
            goals: state.goals.filter(goal => goal.id !== goalId),
            isLoading: false
          }))
        } catch (error) {
          set({ error: 'Failed to delete goal', isLoading: false })
          throw error
        }
      },

      getGoalsByUser: (userId: string) => {
        return get().goals.filter(goal => goal.userId === userId)
      },

      updateGoalProgress: async (goalId: string, currentAmount: number) => {
        const { updateGoal } = get()
        await updateGoal(goalId, { currentAmount })
      },
    }),
    {
      name: 'simple-goals-store',
    }
  )
)
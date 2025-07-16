import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SimpleUserProfile, CreateProfileData } from '../types/simple'

interface ProfileState {
  profile: SimpleUserProfile | null
  isLoading: boolean
  error: string | null
  
  // Actions
  createProfile: (data: CreateProfileData) => Promise<void>
  updateProfile: (updates: Partial<SimpleUserProfile>) => Promise<void>
  getProfile: () => SimpleUserProfile | null
  clearProfile: () => void
}

export const useSimpleProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      isLoading: false,
      error: null,

      createProfile: async (data: CreateProfileData) => {
        set({ isLoading: true, error: null })
        try {
          const profile: SimpleUserProfile = {
            id: crypto.randomUUID(),
            ...data,
            currentDebt: data.currentDebt || 0,
            emergencyFund: data.emergencyFund || 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          set({ profile, isLoading: false })
        } catch (error) {
          set({ error: 'Failed to create profile', isLoading: false })
          throw error
        }
      },

      updateProfile: async (updates: Partial<SimpleUserProfile>) => {
        const currentProfile = get().profile
        if (!currentProfile) {
          throw new Error('No profile to update')
        }

        set({ isLoading: true, error: null })
        try {
          const updatedProfile = {
            ...currentProfile,
            ...updates,
            updatedAt: new Date(),
          }
          set({ profile: updatedProfile, isLoading: false })
        } catch (error) {
          set({ error: 'Failed to update profile', isLoading: false })
          throw error
        }
      },

      getProfile: () => get().profile,

      clearProfile: () => set({ profile: null, error: null }),
    }),
    {
      name: 'simple-profile-store',
    }
  )
)
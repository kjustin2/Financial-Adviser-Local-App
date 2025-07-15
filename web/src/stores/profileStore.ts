import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storageService } from '../services/storage'
import type { UserProfile, CreateUserProfileData, UpdateUserProfileData } from '../types'

interface ProfileState {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
}

interface ProfileActions {
  createProfile: (data: CreateUserProfileData) => Promise<void>
  loadProfile: () => Promise<void>
  updateProfile: (data: UpdateUserProfileData) => Promise<void>
  deleteProfile: () => Promise<void>
  clearError: () => void
}

export const useProfileStore = create<ProfileState & ProfileActions>()(
  persist(
    (set, get) => ({
      // State
      profile: null,
      isLoading: false,
      error: null,

      // Actions
      createProfile: async (data: CreateUserProfileData) => {
        set({ isLoading: true, error: null })
        try {
          const profile = await storageService.createProfile(data)
          set({ profile, isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create profile',
            isLoading: false 
          })
          throw error
        }
      },

      loadProfile: async () => {
        set({ isLoading: true, error: null })
        try {
          const profile = await storageService.getProfile()
          set({ profile, isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load profile',
            isLoading: false 
          })
        }
      },

      updateProfile: async (data: UpdateUserProfileData) => {
        set({ isLoading: true, error: null })
        try {
          const profile = await storageService.updateProfile(data)
          set({ profile, isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update profile',
            isLoading: false 
          })
          throw error
        }
      },

      deleteProfile: async () => {
        const { profile } = get()
        if (!profile) return

        set({ isLoading: true, error: null })
        try {
          await storageService.deleteProfile(profile.id)
          set({ profile: null, isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete profile',
            isLoading: false 
          })
          throw error
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'profile-storage',
      partialize: (state) => ({ profile: state.profile })
    }
  )
)
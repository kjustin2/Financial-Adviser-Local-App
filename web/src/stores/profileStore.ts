import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storageService } from '../services/storage'
import type { UserProfile, CreateUserProfileData, UpdateUserProfileData } from '../types'
import type { OnboardingStepData } from './onboardingStore'
import { ExperienceLevel, RiskTolerance, TimeHorizon } from '../types/enums'

interface ProfileState {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  hasProfile: boolean
}

interface ProfileActions {
  createProfile: (data: CreateUserProfileData) => Promise<void>
  createProfileFromOnboarding: (onboardingData: OnboardingStepData) => Promise<void>
  loadProfile: () => Promise<void>
  updateProfile: (data: UpdateUserProfileData) => Promise<void>
  deleteProfile: () => Promise<void>
  clearError: () => void
  checkProfileExists: () => Promise<boolean>
  calculateRiskScore: (experienceLevel: ExperienceLevel, riskTolerance: RiskTolerance) => number
}

export const useProfileStore = create<ProfileState & ProfileActions>()(
  persist(
    (set, get) => ({
      // State
      profile: null,
      isLoading: false,
      error: null,
      hasProfile: false,

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

      clearError: () => set({ error: null }),

      createProfileFromOnboarding: async (onboardingData: OnboardingStepData) => {
        set({ isLoading: true, error: null })
        try {
          // const { calculateRiskScore } = get()
          
          // Convert onboarding data to profile format
          const profileData: CreateUserProfileData = {
            personalInfo: {
              name: onboardingData.name || '',
              age: onboardingData.age || 0,
              incomeRange: onboardingData.incomeRange || ''
            },
            investmentProfile: {
              experienceLevel: onboardingData.experienceLevel as ExperienceLevel || ExperienceLevel.BEGINNER,
              riskTolerance: onboardingData.riskTolerance as RiskTolerance || RiskTolerance.MODERATE,
              investmentKnowledge: onboardingData.investmentKnowledge || []
            },
            goals: {
              primaryGoals: onboardingData.primaryGoals || [],
              timeHorizon: onboardingData.timeHorizon as TimeHorizon || TimeHorizon.LONG_TERM,
              targetRetirementAge: onboardingData.targetRetirementAge,
              specificGoalAmounts: onboardingData.specificGoalAmounts || {}
            },
            currentSituation: {
              existingInvestments: onboardingData.existingInvestments || 0,
              monthlySavings: onboardingData.monthlySavings || 0,
              emergencyFund: onboardingData.emergencyFund || 0,
              currentDebt: onboardingData.currentDebt || 0
            },
            preferences: {
              communicationStyle: 'detailed',
              updateFrequency: 'weekly'
            }
          }

          const profile = await storageService.createProfile(profileData)
          set({ profile, isLoading: false, hasProfile: true })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create profile from onboarding',
            isLoading: false 
          })
          throw error
        }
      },

      checkProfileExists: async () => {
        try {
          const profile = await storageService.getProfile()
          const exists = !!profile
          set({ hasProfile: exists })
          return exists
        } catch {
          set({ hasProfile: false })
          return false
        }
      },

      calculateRiskScore: (experienceLevel: ExperienceLevel, riskTolerance: RiskTolerance) => {
        let score = 5 // Base score

        // Adjust based on experience level
        switch (experienceLevel) {
          case ExperienceLevel.BEGINNER:
            score -= 2
            break
          case ExperienceLevel.INTERMEDIATE:
            // No adjustment
            break
          case ExperienceLevel.ADVANCED:
            score += 2
            break
        }

        // Adjust based on risk tolerance
        switch (riskTolerance) {
          case RiskTolerance.CONSERVATIVE:
            score -= 2
            break
          case RiskTolerance.MODERATE:
            // No adjustment
            break
          case RiskTolerance.AGGRESSIVE:
            score += 2
            break
        }

        // Clamp between 1 and 10
        return Math.max(1, Math.min(10, score))
      }
    }),
    {
      name: 'profile-storage',
      partialize: (state) => ({ profile: state.profile })
    }
  )
)
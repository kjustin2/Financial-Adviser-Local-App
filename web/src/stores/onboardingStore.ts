import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { validateStep } from '../utils/validation'

export interface OnboardingStepData {
  // Step 1: Basic Info
  name?: string
  age?: number
  incomeRange?: string
  
  // Step 2: Experience & Risk
  experienceLevel?: string
  riskTolerance?: string
  investmentKnowledge?: string[]
  
  // Step 3: Goals & Timeline
  primaryGoals?: string[]
  timeHorizon?: string
  targetRetirementAge?: number
  specificGoalAmounts?: Record<string, number>
  
  // Step 4: Current Situation
  existingInvestments?: number
  monthlySavings?: number
  emergencyFund?: number
  currentDebt?: number
}

export interface OnboardingState {
  currentStep: number
  totalSteps: number
  stepData: OnboardingStepData
  isComplete: boolean
  canSkip: boolean
  progress: number
  errors: Record<string, string>
}

export interface OnboardingActions {
  setCurrentStep: (step: number) => void
  nextStep: () => void
  previousStep: () => void
  updateStepData: (data: Partial<OnboardingStepData>) => void
  setStepData: (step: number, data: Partial<OnboardingStepData>) => void
  completeOnboarding: () => void
  resetOnboarding: () => void
  setError: (field: string, error: string) => void
  clearError: (field: string) => void
  clearAllErrors: () => void
  validateCurrentStep: () => boolean
  canProceedToNextStep: () => boolean
}

const TOTAL_STEPS = 4

const initialState: OnboardingState = {
  currentStep: 1,
  totalSteps: TOTAL_STEPS,
  stepData: {},
  isComplete: false,
  canSkip: false,
  progress: 0,
  errors: {}
}

export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentStep: (step: number) => {
        const clampedStep = Math.max(1, Math.min(step, TOTAL_STEPS))
        set({ 
          currentStep: clampedStep,
          progress: (clampedStep / TOTAL_STEPS) * 100
        })
      },

      nextStep: () => {
        const { currentStep, validateCurrentStep } = get()
        if (validateCurrentStep() && currentStep < TOTAL_STEPS) {
          set({ 
            currentStep: currentStep + 1,
            progress: ((currentStep + 1) / TOTAL_STEPS) * 100
          })
        }
      },

      previousStep: () => {
        const { currentStep } = get()
        if (currentStep > 1) {
          set({ 
            currentStep: currentStep - 1,
            progress: ((currentStep - 1) / TOTAL_STEPS) * 100
          })
        }
      },

      updateStepData: (data: Partial<OnboardingStepData>) => {
        set(state => ({
          stepData: { ...state.stepData, ...data }
        }))
      },

      setStepData: (_step: number, data: Partial<OnboardingStepData>) => {
        set(state => ({
          stepData: { ...state.stepData, ...data }
        }))
      },

      completeOnboarding: () => {
        set({ 
          isComplete: true,
          currentStep: TOTAL_STEPS,
          progress: 100
        })
      },

      resetOnboarding: () => {
        set(initialState)
      },

      setError: (field: string, error: string) => {
        set(state => ({
          errors: { ...state.errors, [field]: error }
        }))
      },

      clearError: (field: string) => {
        set(state => {
          const newErrors = { ...state.errors }
          delete newErrors[field]
          return { errors: newErrors }
        })
      },

      clearAllErrors: () => {
        set({ errors: {} })
      },

      validateCurrentStep: () => {
        const { currentStep, stepData } = get()
        
        const validation = validateStep(currentStep, stepData)
        
        // Clear all errors first
        set({ errors: {} })
        
        if (!validation.isValid) {
          // Set new errors
          set({ errors: validation.errors })
        }
        
        return validation.isValid
      },

      canProceedToNextStep: () => {
        const { currentStep, validateCurrentStep } = get()
        return currentStep < TOTAL_STEPS && validateCurrentStep()
      }
    }),
    {
      name: 'onboarding-storage',
      partialize: (state) => ({
        currentStep: state.currentStep,
        stepData: state.stepData,
        isComplete: state.isComplete,
        progress: state.progress
      })
    }
  )
)
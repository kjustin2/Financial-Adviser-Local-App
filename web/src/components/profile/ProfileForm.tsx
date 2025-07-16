import React, { useState, useCallback, useMemo } from 'react'
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent } from '../common'
import { ExperienceLevel, RiskTolerance, TimeHorizon } from '../../types/enums'
import type { CreateUserProfileData, UpdateUserProfileData } from '../../types/profile'
import { validateCompleteProfile } from '../../utils/validation'

interface ProfileFormProps {
  initialData?: Partial<CreateUserProfileData>
  onSubmit: (data: CreateUserProfileData | UpdateUserProfileData) => Promise<void>
  onCancel?: () => void
  isEditing?: boolean
  isLoading?: boolean
}

// Form options - memoized to prevent unnecessary re-renders
const FORM_OPTIONS = {
  incomeRanges: [
    { value: 'under_25k', label: 'Under $25,000' },
    { value: '25k_50k', label: '$25,000 - $50,000' },
    { value: '50k_75k', label: '$50,000 - $75,000' },
    { value: '75k_100k', label: '$75,000 - $100,000' },
    { value: '100k_150k', label: '$100,000 - $150,000' },
    { value: '150k_200k', label: '$150,000 - $200,000' },
    { value: 'over_200k', label: 'Over $200,000' }
  ],
  experienceLevels: [
    { value: ExperienceLevel.BEGINNER, label: 'Beginner' },
    { value: ExperienceLevel.INTERMEDIATE, label: 'Intermediate' },
    { value: ExperienceLevel.ADVANCED, label: 'Advanced' }
  ],
  riskTolerances: [
    { value: RiskTolerance.CONSERVATIVE, label: 'Conservative - I prefer stability' },
    { value: RiskTolerance.MODERATE, label: 'Moderate - I can handle some risk' },
    { value: RiskTolerance.AGGRESSIVE, label: 'Aggressive - I want maximum growth' }
  ],
  timeHorizons: [
    { value: TimeHorizon.SHORT_TERM, label: 'Short-term (1-3 years)' },
    { value: TimeHorizon.MEDIUM_TERM, label: 'Medium-term (3-10 years)' },
    { value: TimeHorizon.LONG_TERM, label: 'Long-term (10+ years)' }
  ],
  communicationStyles: [
    { value: 'detailed', label: 'Detailed - I want comprehensive explanations' },
    { value: 'concise', label: 'Concise - Keep it brief and to the point' }
  ],
  updateFrequencies: [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ],
  availableGoals: [
    'retirement',
    'emergency_fund',
    'house_purchase',
    'debt_payoff',
    'education',
    'travel',
    'business',
    'wedding',
    'major_purchase'
  ],
  goalLabels: {
    retirement: 'Retirement planning',
    emergency_fund: 'Emergency fund',
    house_purchase: 'Buy a house',
    debt_payoff: 'Pay off debt',
    education: 'Education funding',
    travel: 'Travel',
    business: 'Start a business',
    wedding: 'Wedding',
    major_purchase: 'Major purchase'
  }
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
  isLoading = false
}) => {
  // Initialize form data with proper nested structure
  const [formData, setFormData] = useState<CreateUserProfileData>(() => ({
    personalInfo: {
      name: initialData?.personalInfo?.name || '',
      age: initialData?.personalInfo?.age || 25,
      incomeRange: initialData?.personalInfo?.incomeRange || ''
    },
    investmentProfile: {
      experienceLevel: initialData?.investmentProfile?.experienceLevel || ExperienceLevel.BEGINNER,
      riskTolerance: initialData?.investmentProfile?.riskTolerance || RiskTolerance.MODERATE,
      investmentKnowledge: initialData?.investmentProfile?.investmentKnowledge || []
    },
    goals: {
      primaryGoals: initialData?.goals?.primaryGoals || [],
      timeHorizon: initialData?.goals?.timeHorizon || TimeHorizon.LONG_TERM,
      targetRetirementAge: initialData?.goals?.targetRetirementAge,
      specificGoalAmounts: initialData?.goals?.specificGoalAmounts || {}
    },
    currentSituation: {
      existingInvestments: initialData?.currentSituation?.existingInvestments || 0,
      monthlySavings: initialData?.currentSituation?.monthlySavings || 0,
      emergencyFund: initialData?.currentSituation?.emergencyFund || 0,
      currentDebt: initialData?.currentSituation?.currentDebt || 0
    },
    preferences: {
      communicationStyle: initialData?.preferences?.communicationStyle || 'detailed',
      updateFrequency: initialData?.preferences?.updateFrequency || 'weekly'
    }
  }))

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Memoized validation function using the imported validator
  const validateForm = useCallback((): boolean => {
    const validation = validateCompleteProfile(formData)
    setErrors(validation.errors)
    return validation.isValid
  }, [formData])

  // Optimized form submission handler
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Failed to save profile:', error)
      setErrors(prev => ({ 
        ...prev, 
        submit: error instanceof Error ? error.message : 'Failed to save profile' 
      }))
    }
  }, [formData, validateForm, onSubmit])

  // Generic handler for nested form updates
  const updateNestedField = useCallback(<T extends keyof CreateUserProfileData>(
    section: T,
    field: keyof Required<CreateUserProfileData>[T],
    value: Required<CreateUserProfileData>[T][keyof Required<CreateUserProfileData>[T]]
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
    
    // Clear related errors
    const errorKey = `${section}.${String(field)}`
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[errorKey]
        return newErrors
      })
    }
  }, [errors])

  // Specific handlers for different form sections
  const handlePersonalInfoChange = useCallback((field: keyof CreateUserProfileData['personalInfo'], value: string | number) => {
    updateNestedField('personalInfo', field, value)
  }, [updateNestedField])

  const handleInvestmentProfileChange = useCallback((field: keyof CreateUserProfileData['investmentProfile'], value: ExperienceLevel | RiskTolerance | string[]) => {
    updateNestedField('investmentProfile', field, value)
  }, [updateNestedField])

  const handleGoalsChange = useCallback((field: keyof CreateUserProfileData['goals'], value: string[] | TimeHorizon | number | Record<string, number> | undefined) => {
    updateNestedField('goals', field, value)
  }, [updateNestedField])

  const handleCurrentSituationChange = useCallback((field: keyof CreateUserProfileData['currentSituation'], value: number) => {
    updateNestedField('currentSituation', field, value)
  }, [updateNestedField])

  const handlePreferencesChange = useCallback((field: keyof Required<CreateUserProfileData>['preferences'], value: 'detailed' | 'concise' | 'daily' | 'weekly' | 'monthly') => {
    updateNestedField('preferences', field, value)
  }, [updateNestedField])

  // Goal toggle handler
  const handleGoalToggle = useCallback((goal: string) => {
    const currentGoals = formData.goals.primaryGoals
    const newGoals = currentGoals.includes(goal)
      ? currentGoals.filter(g => g !== goal)
      : [...currentGoals, goal]
    
    handleGoalsChange('primaryGoals', newGoals)
  }, [formData.goals.primaryGoals, handleGoalsChange])

  // Memoized form sections to prevent unnecessary re-renders
  const formSections = useMemo(() => FORM_OPTIONS, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Update Your Profile' : 'Create Your Investment Profile'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          {/* Global form error */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Personal Information Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Personal Information
            </h3>
            
            <Input
              label="Full Name"
              value={formData.personalInfo.name}
              onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
              error={errors['personalInfo.name']}
              required
              aria-describedby="name-help"
            />
            <p id="name-help" className="text-sm text-gray-500">
              Enter your full legal name as it appears on official documents
            </p>

            <Input
              label="Age"
              type="number"
              min="18"
              max="120"
              value={formData.personalInfo.age}
              onChange={(e) => handlePersonalInfoChange('age', parseInt(e.target.value) || 0)}
              error={errors['personalInfo.age']}
              required
              aria-describedby="age-help"
            />
            <p id="age-help" className="text-sm text-gray-500">
              Must be 18 or older to use this service
            </p>

            <Select
              label="Annual Income Range"
              value={formData.personalInfo.incomeRange}
              onChange={(value) => handlePersonalInfoChange('incomeRange', value)}
              options={formSections.incomeRanges}
              placeholder="Select your income range"
              error={errors['personalInfo.incomeRange']}
              required
              aria-describedby="income-help"
            />
            <p id="income-help" className="text-sm text-gray-500">
              This helps us provide appropriate investment recommendations
            </p>
          </section>

          {/* Investment Profile Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Investment Experience
            </h3>
            
            <Select
              label="Experience Level"
              value={formData.investmentProfile.experienceLevel}
              onChange={(value) => handleInvestmentProfileChange('experienceLevel', value as ExperienceLevel)}
              options={formSections.experienceLevels}
              error={errors['investmentProfile.experienceLevel']}
              required
              aria-describedby="experience-help"
            />
            <p id="experience-help" className="text-sm text-gray-500">
              How familiar are you with investing and financial markets?
            </p>

            <Select
              label="Risk Tolerance"
              value={formData.investmentProfile.riskTolerance}
              onChange={(value) => handleInvestmentProfileChange('riskTolerance', value as RiskTolerance)}
              options={formSections.riskTolerances}
              error={errors['investmentProfile.riskTolerance']}
              required
              aria-describedby="risk-help"
            />
            <p id="risk-help" className="text-sm text-gray-500">
              How comfortable are you with investment volatility?
            </p>
          </section>

          {/* Goals Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Financial Goals
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Primary Goals (Select all that apply)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3" role="group" aria-labelledby="goals-label">
                {formSections.availableGoals.map(goal => (
                  <label key={goal} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.goals.primaryGoals.includes(goal)}
                      onChange={() => handleGoalToggle(goal)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2"
                      aria-describedby={`goal-${goal}-desc`}
                    />
                    <span className="text-sm text-gray-900">
                      {formSections.goalLabels[goal as keyof typeof formSections.goalLabels]}
                    </span>
                  </label>
                ))}
              </div>
              {errors['goals.primaryGoals'] && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {errors['goals.primaryGoals']}
                </p>
              )}
            </div>

            <Select
              label="Investment Time Horizon"
              value={formData.goals.timeHorizon}
              onChange={(value) => handleGoalsChange('timeHorizon', value as TimeHorizon)}
              options={formSections.timeHorizons}
              error={errors['goals.timeHorizon']}
              required
              aria-describedby="horizon-help"
            />
            <p id="horizon-help" className="text-sm text-gray-500">
              When do you plan to use this money?
            </p>

            {/* Conditional retirement age field */}
            {formData.goals.primaryGoals.includes('retirement') && (
              <Input
                label="Target Retirement Age (Optional)"
                type="number"
                min="50"
                max="80"
                value={formData.goals.targetRetirementAge || ''}
                onChange={(e) => handleGoalsChange('targetRetirementAge', parseInt(e.target.value) || undefined)}
                error={errors['goals.targetRetirementAge']}
                aria-describedby="retirement-help"
              />
            )}
            {formData.goals.primaryGoals.includes('retirement') && (
              <p id="retirement-help" className="text-sm text-gray-500">
                When do you plan to retire? This helps us calculate your investment timeline.
              </p>
            )}
          </section>

          {/* Current Financial Situation Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Current Financial Situation
            </h3>
            
            <Input
              label="Existing Investments ($)"
              type="number"
              min="0"
              step="100"
              value={formData.currentSituation.existingInvestments}
              onChange={(e) => handleCurrentSituationChange('existingInvestments', parseFloat(e.target.value) || 0)}
              error={errors['currentSituation.existingInvestments']}
              aria-describedby="investments-help"
            />
            <p id="investments-help" className="text-sm text-gray-500">
              Total value of your current investments (stocks, bonds, funds, etc.)
            </p>

            <Input
              label="Monthly Savings ($)"
              type="number"
              min="0"
              step="50"
              value={formData.currentSituation.monthlySavings}
              onChange={(e) => handleCurrentSituationChange('monthlySavings', parseFloat(e.target.value) || 0)}
              error={errors['currentSituation.monthlySavings']}
              aria-describedby="savings-help"
            />
            <p id="savings-help" className="text-sm text-gray-500">
              How much can you typically save and invest each month?
            </p>

            <Input
              label="Emergency Fund ($)"
              type="number"
              min="0"
              step="100"
              value={formData.currentSituation.emergencyFund}
              onChange={(e) => handleCurrentSituationChange('emergencyFund', parseFloat(e.target.value) || 0)}
              error={errors['currentSituation.emergencyFund']}
              aria-describedby="emergency-help"
            />
            <p id="emergency-help" className="text-sm text-gray-500">
              Money set aside for unexpected expenses (separate from investments)
            </p>

            <Input
              label="Current Debt ($) - Optional"
              type="number"
              min="0"
              step="100"
              value={formData.currentSituation.currentDebt || ''}
              onChange={(e) => handleCurrentSituationChange('currentDebt', parseFloat(e.target.value) || 0)}
              error={errors['currentSituation.currentDebt']}
              aria-describedby="debt-help"
            />
            <p id="debt-help" className="text-sm text-gray-500">
              High-interest debt like credit cards (exclude mortgage)
            </p>
          </section>

          {/* Preferences Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Communication Preferences
            </h3>
            
            <Select
              label="Communication Style"
              value={formData.preferences?.communicationStyle || 'detailed'}
              onChange={(value) => handlePreferencesChange('communicationStyle', value as 'detailed' | 'concise')}
              options={formSections.communicationStyles}
              aria-describedby="communication-help"
            />
            <p id="communication-help" className="text-sm text-gray-500">
              How would you like to receive recommendations and updates?
            </p>

            <Select
              label="Update Frequency"
              value={formData.preferences?.updateFrequency || 'weekly'}
              onChange={(value) => handlePreferencesChange('updateFrequency', value as 'daily' | 'weekly' | 'monthly')}
              options={formSections.updateFrequencies}
              aria-describedby="frequency-help"
            />
            <p id="frequency-help" className="text-sm text-gray-500">
              How often would you like to receive portfolio updates?
            </p>
          </section>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isLoading}
              className="min-w-32"
            >
              {isLoading ? 'Saving...' : isEditing ? 'Update Profile' : 'Create Profile'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
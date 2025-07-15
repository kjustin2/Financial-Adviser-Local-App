import React, { useState } from 'react'
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent } from '../common'
import { ExperienceLevel, RiskTolerance, TimeHorizon, MajorPurchase } from '../../types'
import type { CreateUserProfileData, UpdateUserProfileData } from '../../types'

interface ProfileFormProps {
  initialData?: Partial<CreateUserProfileData>
  onSubmit: (data: CreateUserProfileData | UpdateUserProfileData) => Promise<void>
  onCancel?: () => void
  isEditing?: boolean
  isLoading?: boolean
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<CreateUserProfileData>({
    name: initialData?.name || '',
    age: initialData?.age || 25,
    incomeRange: initialData?.incomeRange || '',
    experienceLevel: initialData?.experienceLevel || ExperienceLevel.BEGINNER,
    riskTolerance: initialData?.riskTolerance || RiskTolerance.MODERATE,
    financialGoals: initialData?.financialGoals || [],
    timeHorizon: initialData?.timeHorizon || TimeHorizon.LONG_TERM,
    majorPurchases: initialData?.majorPurchases || []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const incomeRanges = [
    { value: 'under_25k', label: 'Under $25,000' },
    { value: '25k_50k', label: '$25,000 - $50,000' },
    { value: '50k_75k', label: '$50,000 - $75,000' },
    { value: '75k_100k', label: '$75,000 - $100,000' },
    { value: '100k_150k', label: '$100,000 - $150,000' },
    { value: '150k_200k', label: '$150,000 - $200,000' },
    { value: 'over_200k', label: 'Over $200,000' }
  ]

  const experienceLevels = [
    { value: ExperienceLevel.BEGINNER, label: 'Beginner' },
    { value: ExperienceLevel.INTERMEDIATE, label: 'Intermediate' },
    { value: ExperienceLevel.ADVANCED, label: 'Advanced' }
  ]

  const riskTolerances = [
    { value: RiskTolerance.CONSERVATIVE, label: 'Conservative - I prefer stability' },
    { value: RiskTolerance.MODERATE, label: 'Moderate - I can handle some risk' },
    { value: RiskTolerance.AGGRESSIVE, label: 'Aggressive - I want maximum growth' }
  ]

  const timeHorizons = [
    { value: TimeHorizon.SHORT_TERM, label: 'Short-term (1-3 years)' },
    { value: TimeHorizon.MEDIUM_TERM, label: 'Medium-term (3-10 years)' },
    { value: TimeHorizon.LONG_TERM, label: 'Long-term (10+ years)' }
  ]

  const availableGoals = [
    'Retirement planning',
    'Emergency fund',
    'Buy a house',
    'Pay off debt',
    'Education funding',
    'Travel',
    'Start a business',
    'Wedding',
    'Major purchase'
  ]

  const majorPurchaseOptions = [
    { value: MajorPurchase.HOUSE, label: 'House' },
    { value: MajorPurchase.CAR, label: 'Car' },
    { value: MajorPurchase.WEDDING, label: 'Wedding' },
    { value: MajorPurchase.EDUCATION, label: 'Education' },
    { value: MajorPurchase.NONE, label: 'None' }
  ]

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (formData.age < 18 || formData.age > 120) {
      newErrors.age = 'Age must be between 18 and 120'
    }

    if (!formData.incomeRange) {
      newErrors.incomeRange = 'Income range is required'
    }

    if (formData.financialGoals.length === 0) {
      newErrors.financialGoals = 'Please select at least one financial goal'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Failed to save profile:', error)
    }
  }

  const handleInputChange = (field: keyof CreateUserProfileData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleGoalToggle = (goal: string) => {
    const currentGoals = formData.financialGoals
    const newGoals = currentGoals.includes(goal)
      ? currentGoals.filter(g => g !== goal)
      : [...currentGoals, goal]
    
    handleInputChange('financialGoals', newGoals)
  }

  const handleMajorPurchaseToggle = (purchase: MajorPurchase) => {
    const currentPurchases = formData.majorPurchases
    const newPurchases = currentPurchases.includes(purchase)
      ? currentPurchases.filter(p => p !== purchase)
      : [...currentPurchases, purchase]
    
    handleInputChange('majorPurchases', newPurchases)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Update Your Profile' : 'Create Your Investment Profile'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={errors.name}
              required
            />

            <Input
              label="Age"
              type="number"
              min="18"
              max="120"
              value={formData.age}
              onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
              error={errors.age}
              required
            />

            <Select
              label="Annual Income Range"
              value={formData.incomeRange}
              onChange={(value) => handleInputChange('incomeRange', value)}
              options={incomeRanges}
              placeholder="Select your income range"
              error={errors.incomeRange}
              required
            />
          </div>

          {/* Investment Experience */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Investment Experience</h3>
            
            <Select
              label="Experience Level"
              value={formData.experienceLevel}
              onChange={(value) => handleInputChange('experienceLevel', value as ExperienceLevel)}
              options={experienceLevels}
              required
            />

            <Select
              label="Risk Tolerance"
              value={formData.riskTolerance}
              onChange={(value) => handleInputChange('riskTolerance', value as RiskTolerance)}
              options={riskTolerances}
              required
            />

            <Select
              label="Investment Time Horizon"
              value={formData.timeHorizon}
              onChange={(value) => handleInputChange('timeHorizon', value as TimeHorizon)}
              options={timeHorizons}
              required
            />
          </div>

          {/* Financial Goals */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Financial Goals</h3>
            <p className="text-sm text-gray-600">Select all that apply to you:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableGoals.map(goal => (
                <label key={goal} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.financialGoals.includes(goal)}
                    onChange={() => handleGoalToggle(goal)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm">{goal}</span>
                </label>
              ))}
            </div>
            {errors.financialGoals && (
              <p className="text-sm text-red-600">{errors.financialGoals}</p>
            )}
          </div>

          {/* Major Purchases */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Planned Major Purchases</h3>
            <p className="text-sm text-gray-600">What major purchases are you planning in the next 5 years?</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {majorPurchaseOptions.map(purchase => (
                <label key={purchase.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.majorPurchases.includes(purchase.value)}
                    onChange={() => handleMajorPurchaseToggle(purchase.value)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm">{purchase.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Update Profile' : 'Create Profile'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
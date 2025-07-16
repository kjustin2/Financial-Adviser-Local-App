import React from 'react'
import { Input, Select } from '../../common'
import { useOnboardingStore } from '../../../stores/onboardingStore'

const INCOME_RANGES = [
  { value: 'under_25k', label: 'Under $25,000' },
  { value: '25k_50k', label: '$25,000 - $50,000' },
  { value: '50k_75k', label: '$50,000 - $75,000' },
  { value: '75k_100k', label: '$75,000 - $100,000' },
  { value: '100k_150k', label: '$100,000 - $150,000' },
  { value: '150k_250k', label: '$150,000 - $250,000' },
  { value: 'over_250k', label: 'Over $250,000' }
]

export const BasicInfoStep: React.FC = () => {
  const { stepData, updateStepData, errors, clearError } = useOnboardingStore()

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    updateStepData({ name: value })
    if (value.trim()) {
      clearError('name')
    }
  }

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    updateStepData({ age: isNaN(value) ? undefined : value })
    if (value >= 18 && value <= 100) {
      clearError('age')
    }
  }

  const handleIncomeRangeChange = (value: string) => {
    updateStepData({ incomeRange: value })
    if (value) {
      clearError('incomeRange')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Full Name *
        </label>
        <Input
          id="name"
          type="text"
          value={stepData.name || ''}
          onChange={handleNameChange}
          placeholder="Enter your full name"
          error={errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="mt-1 text-sm text-red-600">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
          Age *
        </label>
        <Input
          id="age"
          type="number"
          min="18"
          max="100"
          value={stepData.age || ''}
          onChange={handleAgeChange}
          placeholder="Enter your age"
          error={errors.age}
          aria-describedby={errors.age ? 'age-error' : undefined}
        />
        {errors.age && (
          <p id="age-error" className="mt-1 text-sm text-red-600">
            {errors.age}
          </p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Must be 18 or older to use this service
        </p>
      </div>

      <div>
        <label htmlFor="incomeRange" className="block text-sm font-medium text-gray-700 mb-2">
          Annual Income Range *
        </label>
        <Select
          id="incomeRange"
          value={stepData.incomeRange || ''}
          onChange={handleIncomeRangeChange}
          options={[
            { value: '', label: 'Select your income range' },
            ...INCOME_RANGES
          ]}
          error={errors.incomeRange}
          aria-describedby={errors.incomeRange ? 'income-error' : undefined}
        />
        {errors.incomeRange && (
          <p id="income-error" className="mt-1 text-sm text-red-600">
            {errors.incomeRange}
          </p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          This helps us provide appropriate investment recommendations
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          Privacy Notice
        </h3>
        <p className="text-sm text-blue-700">
          All information you provide is stored locally in your browser and never transmitted 
          to external servers. Your privacy is completely protected.
        </p>
      </div>
    </div>
  )
}
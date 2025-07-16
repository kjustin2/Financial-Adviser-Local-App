import React from 'react'
import { Input } from '../../common'
import { useOnboardingStore } from '../../../stores/onboardingStore'

const PRIMARY_GOALS = [
  { value: 'retirement', label: 'Retirement Planning', icon: '🏖️' },
  { value: 'emergency_fund', label: 'Emergency Fund', icon: '🛡️' },
  { value: 'house_purchase', label: 'Home Purchase', icon: '🏠' },
  { value: 'education', label: 'Education Funding', icon: '🎓' },
  { value: 'debt_payoff', label: 'Debt Payoff', icon: '💳' },
  { value: 'wealth_building', label: 'General Wealth Building', icon: '📈' },
  { value: 'major_purchase', label: 'Major Purchase', icon: '🚗' },
  { value: 'travel', label: 'Travel & Experiences', icon: '✈️' }
]

const TIME_HORIZONS = [
  { 
    value: 'short_term', 
    label: 'Short Term (1-3 years)',
    description: 'Need money soon for immediate goals'
  },
  { 
    value: 'medium_term', 
    label: 'Medium Term (3-10 years)',
    description: 'Planning for goals in the next decade'
  },
  { 
    value: 'long_term', 
    label: 'Long Term (10+ years)',
    description: 'Building wealth for distant future goals'
  }
]

export const GoalsTimelineStep: React.FC = () => {
  const { stepData, updateStepData, errors, clearError } = useOnboardingStore()

  const handleGoalToggle = (goalValue: string) => {
    const currentGoals = stepData.primaryGoals || []
    const updatedGoals = currentGoals.includes(goalValue)
      ? currentGoals.filter(g => g !== goalValue)
      : [...currentGoals, goalValue]
    
    updateStepData({ primaryGoals: updatedGoals })
    if (updatedGoals.length > 0) {
      clearError('primaryGoals')
    }
  }

  const handleTimeHorizonChange = (value: string) => {
    updateStepData({ timeHorizon: value })
    if (value) {
      clearError('timeHorizon')
    }
  }

  const handleRetirementAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    updateStepData({ targetRetirementAge: isNaN(value) ? undefined : value })
  }

  const handleGoalAmountChange = (goal: string, amount: string) => {
    const numericAmount = parseFloat(amount)
    const currentAmounts = stepData.specificGoalAmounts || {}
    
    if (isNaN(numericAmount) || amount === '') {
      const { [goal]: _removed, ...rest } = currentAmounts
      updateStepData({ specificGoalAmounts: rest })
    } else {
      updateStepData({ 
        specificGoalAmounts: { 
          ...currentAmounts, 
          [goal]: numericAmount 
        }
      })
    }
  }

  const selectedGoals = stepData.primaryGoals || []
  const showRetirementAge = selectedGoals.includes('retirement')

  return (
    <div className="space-y-8">
      {/* Primary Goals */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Primary Financial Goals * (Select all that apply)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PRIMARY_GOALS.map((goal) => (
            <label
              key={goal.value}
              className={`
                flex items-center p-4 border rounded-lg cursor-pointer transition-colors
                ${selectedGoals.includes(goal.value)
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <input
                type="checkbox"
                checked={selectedGoals.includes(goal.value)}
                onChange={() => handleGoalToggle(goal.value)}
                className="sr-only"
              />
              <div className={`
                w-4 h-4 border-2 rounded mr-3 flex items-center justify-center
                ${selectedGoals.includes(goal.value)
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-gray-300'
                }
              `}>
                {selectedGoals.includes(goal.value) && (
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-lg mr-2">{goal.icon}</span>
              <span className="text-sm text-gray-900">{goal.label}</span>
            </label>
          ))}
        </div>
        {errors.primaryGoals && (
          <p className="mt-2 text-sm text-red-600">{errors.primaryGoals}</p>
        )}
      </div>

      {/* Time Horizon */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Investment Time Horizon *
        </label>
        <div className="space-y-3">
          {TIME_HORIZONS.map((horizon) => (
            <label
              key={horizon.value}
              className={`
                block p-4 border rounded-lg cursor-pointer transition-colors
                ${stepData.timeHorizon === horizon.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <input
                type="radio"
                name="timeHorizon"
                value={horizon.value}
                checked={stepData.timeHorizon === horizon.value}
                onChange={(e) => handleTimeHorizonChange(e.target.value)}
                className="sr-only"
              />
              <div className="flex items-start">
                <div className={`
                  w-4 h-4 rounded-full border-2 mt-0.5 mr-3 flex-shrink-0
                  ${stepData.timeHorizon === horizon.value
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-gray-300'
                  }
                `}>
                  {stepData.timeHorizon === horizon.value && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{horizon.label}</div>
                  <div className="text-sm text-gray-600">{horizon.description}</div>
                </div>
              </div>
            </label>
          ))}
        </div>
        {errors.timeHorizon && (
          <p className="mt-2 text-sm text-red-600">{errors.timeHorizon}</p>
        )}
      </div>

      {/* Target Retirement Age (if retirement is selected) */}
      {showRetirementAge && (
        <div>
          <label htmlFor="retirementAge" className="block text-sm font-medium text-gray-700 mb-2">
            Target Retirement Age
          </label>
          <Input
            id="retirementAge"
            type="number"
            min="50"
            max="80"
            value={stepData.targetRetirementAge || ''}
            onChange={handleRetirementAgeChange}
            placeholder="e.g., 65"
            className="max-w-xs"
          />
          <p className="mt-1 text-sm text-gray-500">
            When do you plan to retire?
          </p>
        </div>
      )}

      {/* Specific Goal Amounts (Optional) */}
      {selectedGoals.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Target Amounts (Optional)
          </label>
          <p className="text-sm text-gray-600 mb-4">
            Set specific target amounts for your goals to get more precise recommendations:
          </p>
          <div className="space-y-4">
            {selectedGoals.map((goalValue) => {
              const goal = PRIMARY_GOALS.find(g => g.value === goalValue)
              if (!goal) return null

              return (
                <div key={goalValue} className="flex items-center space-x-3">
                  <span className="text-lg">{goal.icon}</span>
                  <label htmlFor={`amount-${goalValue}`} className="text-sm text-gray-700 min-w-0 flex-1">
                    {goal.label}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id={`amount-${goalValue}`}
                      type="number"
                      min="0"
                      step="1000"
                      value={stepData.specificGoalAmounts?.[goalValue] || ''}
                      onChange={(e) => handleGoalAmountChange(goalValue, e.target.value)}
                      placeholder="0"
                      className="pl-8 w-32"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
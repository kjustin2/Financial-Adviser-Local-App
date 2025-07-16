import React from 'react'

import { useOnboardingStore } from '../../../stores/onboardingStore'

const EXPERIENCE_LEVELS = [
  { 
    value: 'beginner', 
    label: 'Beginner',
    description: 'New to investing or have limited experience'
  },
  { 
    value: 'intermediate', 
    label: 'Intermediate',
    description: 'Some experience with basic investments'
  },
  { 
    value: 'advanced', 
    label: 'Advanced',
    description: 'Experienced with various investment types'
  }
]

const RISK_TOLERANCE_OPTIONS = [
  {
    value: 'conservative',
    label: 'Conservative',
    description: 'Prefer stability and lower risk, even if returns are lower'
  },
  {
    value: 'moderate',
    label: 'Moderate',
    description: 'Comfortable with some risk for potentially higher returns'
  },
  {
    value: 'aggressive',
    label: 'Aggressive',
    description: 'Willing to accept higher risk for potentially higher returns'
  }
]

const INVESTMENT_KNOWLEDGE_OPTIONS = [
  'Stocks and ETFs',
  'Bonds and Fixed Income',
  'Mutual Funds',
  'Real Estate Investment',
  'Cryptocurrency',
  'Options and Derivatives',
  'International Markets',
  'Tax-Advantaged Accounts'
]

export const ExperienceRiskStep: React.FC = () => {
  const { stepData, updateStepData, errors, clearError } = useOnboardingStore()

  const handleExperienceLevelChange = (value: string) => {
    updateStepData({ experienceLevel: value })
    if (value) {
      clearError('experienceLevel')
    }
  }

  const handleRiskToleranceChange = (value: string) => {
    updateStepData({ riskTolerance: value })
    if (value) {
      clearError('riskTolerance')
    }
  }

  const handleKnowledgeToggle = (knowledge: string) => {
    const currentKnowledge = stepData.investmentKnowledge || []
    const updatedKnowledge = currentKnowledge.includes(knowledge)
      ? currentKnowledge.filter(k => k !== knowledge)
      : [...currentKnowledge, knowledge]
    
    updateStepData({ investmentKnowledge: updatedKnowledge })
  }

  return (
    <div className="space-y-8">
      {/* Investment Experience */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Investment Experience Level *
        </label>
        <div className="space-y-3">
          {EXPERIENCE_LEVELS.map((level) => (
            <label
              key={level.value}
              className={`
                block p-4 border rounded-lg cursor-pointer transition-colors
                ${stepData.experienceLevel === level.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <input
                type="radio"
                name="experienceLevel"
                value={level.value}
                checked={stepData.experienceLevel === level.value}
                onChange={(e) => handleExperienceLevelChange(e.target.value)}
                className="sr-only"
              />
              <div className="flex items-start">
                <div className={`
                  w-4 h-4 rounded-full border-2 mt-0.5 mr-3 flex-shrink-0
                  ${stepData.experienceLevel === level.value
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-gray-300'
                  }
                `}>
                  {stepData.experienceLevel === level.value && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{level.label}</div>
                  <div className="text-sm text-gray-600">{level.description}</div>
                </div>
              </div>
            </label>
          ))}
        </div>
        {errors.experienceLevel && (
          <p className="mt-2 text-sm text-red-600">{errors.experienceLevel}</p>
        )}
      </div>

      {/* Risk Tolerance */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Risk Tolerance *
        </label>
        <div className="space-y-3">
          {RISK_TOLERANCE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`
                block p-4 border rounded-lg cursor-pointer transition-colors
                ${stepData.riskTolerance === option.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <input
                type="radio"
                name="riskTolerance"
                value={option.value}
                checked={stepData.riskTolerance === option.value}
                onChange={(e) => handleRiskToleranceChange(e.target.value)}
                className="sr-only"
              />
              <div className="flex items-start">
                <div className={`
                  w-4 h-4 rounded-full border-2 mt-0.5 mr-3 flex-shrink-0
                  ${stepData.riskTolerance === option.value
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-gray-300'
                  }
                `}>
                  {stepData.riskTolerance === option.value && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </div>
              </div>
            </label>
          ))}
        </div>
        {errors.riskTolerance && (
          <p className="mt-2 text-sm text-red-600">{errors.riskTolerance}</p>
        )}
      </div>

      {/* Investment Knowledge (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Investment Knowledge (Optional)
        </label>
        <p className="text-sm text-gray-600 mb-4">
          Select areas where you have knowledge or experience:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {INVESTMENT_KNOWLEDGE_OPTIONS.map((knowledge) => (
            <label
              key={knowledge}
              className={`
                flex items-center p-3 border rounded-lg cursor-pointer transition-colors
                ${(stepData.investmentKnowledge || []).includes(knowledge)
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <input
                type="checkbox"
                checked={(stepData.investmentKnowledge || []).includes(knowledge)}
                onChange={() => handleKnowledgeToggle(knowledge)}
                className="sr-only"
              />
              <div className={`
                w-4 h-4 border-2 rounded mr-3 flex items-center justify-center
                ${(stepData.investmentKnowledge || []).includes(knowledge)
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-gray-300'
                }
              `}>
                {(stepData.investmentKnowledge || []).includes(knowledge) && (
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-900">{knowledge}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
import React from 'react'
import { Button, Card, CardContent, ProgressBar } from '../common'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { useOnboardingStore } from '../../stores/onboardingStore'
import { BasicInfoStep } from './steps/BasicInfoStep'
import { ExperienceRiskStep } from './steps/ExperienceRiskStep'
import { GoalsTimelineStep } from './steps/GoalsTimelineStep'
import { CurrentSituationStep } from './steps/CurrentSituationStep'

export interface ProfileWizardProps {
  onComplete: () => void
  onCancel?: () => void
}

export const ProfileWizard: React.FC<ProfileWizardProps> = ({ onComplete, onCancel }) => {
  const {
    currentStep,
    totalSteps,
    progress,
    canProceedToNextStep,
    nextStep,
    previousStep,
    validateCurrentStep,
    errors
  } = useOnboardingStore()

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep === totalSteps) {
        onComplete()
      } else {
        nextStep()
      }
    }
  }

  const handlePrevious = () => {
    previousStep()
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep />
      case 2:
        return <ExperienceRiskStep />
      case 3:
        return <GoalsTimelineStep />
      case 4:
        return <CurrentSituationStep />
      default:
        return <BasicInfoStep />
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Basic Information'
      case 2:
        return 'Investment Experience'
      case 3:
        return 'Financial Goals'
      case 4:
        return 'Current Situation'
      default:
        return 'Profile Setup'
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return 'Tell us a bit about yourself to get started'
      case 2:
        return 'Help us understand your investment experience and risk tolerance'
      case 3:
        return 'What are your financial goals and timeline?'
      case 4:
        return 'Let us know about your current financial situation'
      default:
        return 'Complete your profile setup'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Create Your Profile</h1>
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <ProgressBar
              value={progress}
              showLabel={true}
              label={`Step ${currentStep} of ${totalSteps}`}
              color="primary"
              size="md"
            />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between">
            {Array.from({ length: totalSteps }, (_, index) => {
              const stepNumber = index + 1
              const isCompleted = stepNumber < currentStep
              const isCurrent = stepNumber === currentStep
              
              return (
                <div key={stepNumber} className="flex flex-col items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${isCompleted 
                      ? 'bg-primary-600 text-white' 
                      : isCurrent 
                        ? 'bg-primary-100 text-primary-600 border-2 border-primary-600'
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}>
                    {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-center max-w-16">
                    {stepNumber === 1 && 'Basic'}
                    {stepNumber === 2 && 'Experience'}
                    {stepNumber === 3 && 'Goals'}
                    {stepNumber === 4 && 'Situation'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {getStepTitle()}
              </h2>
              <p className="text-gray-600">
                {getStepDescription()}
              </p>
            </div>

            {/* Error Summary */}
            {Object.keys(errors).length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <h3 className="text-sm font-medium text-red-800 mb-2">
                  Please fix the following errors:
                </h3>
                <ul className="text-sm text-red-700 space-y-1">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Step Component */}
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceedToNextStep() && currentStep < totalSteps}
            className="flex items-center"
          >
            {currentStep === totalSteps ? 'Complete Profile' : 'Next'}
            {currentStep < totalSteps && <ChevronRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WelcomeScreen } from '../components/onboarding/WelcomeScreen'
import { ProfileWizard } from '../components/onboarding/ProfileWizard'
import { useOnboardingStore } from '../stores/onboardingStore'
import { useProfileStore } from '../stores/profileStore'
import { Layout } from '../components/layout/Layout'
import { LoadingOverlay } from '../components/common'
import { useToast } from '../hooks/useToast'

export const Onboarding: React.FC = () => {
  const [showWizard, setShowWizard] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const navigate = useNavigate()
  const { stepData, completeOnboarding, resetOnboarding } = useOnboardingStore()
  const { createProfileFromOnboarding } = useProfileStore()
  const { success, error } = useToast()

  const handleStartOnboarding = () => {
    setShowWizard(true)
  }

  const handleCompleteOnboarding = async () => {
    setIsCompleting(true)
    try {
      // Create profile from onboarding data
      await createProfileFromOnboarding(stepData)
      
      // Mark onboarding as complete
      completeOnboarding()
      
      // Show success message
      success('Profile Created!', 'Welcome to your personalized financial advisor')
      
      // Navigate to dashboard after a brief delay
      setTimeout(() => {
        navigate('/', { replace: true })
      }, 1000)
    } catch (err) {
      console.error('Failed to complete onboarding:', err)
      error(
        'Profile Creation Failed', 
        'There was an error creating your profile. Please try again.',
        {
          action: {
            label: 'Retry',
            onClick: () => handleCompleteOnboarding()
          }
        }
      )
    } finally {
      setIsCompleting(false)
    }
  }

  const handleCancelOnboarding = () => {
    setShowWizard(false)
    resetOnboarding()
  }

  if (showWizard) {
    return (
      <Layout showNavigation={false}>
        <LoadingOverlay 
          isLoading={isCompleting} 
          message="Creating your profile..."
        >
          <ProfileWizard 
            onComplete={handleCompleteOnboarding}
            onCancel={handleCancelOnboarding}
          />
        </LoadingOverlay>
      </Layout>
    )
  }

  return (
    <WelcomeScreen onStartOnboarding={handleStartOnboarding} />
  )
}
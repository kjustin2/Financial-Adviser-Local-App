import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useProfileStore } from '../../stores/profileStore'
import { LoadingSpinner } from './LoadingSpinner'

export interface NavigationGuardProps {
  children: React.ReactNode
  requiresProfile?: boolean
  redirectTo?: string
}

export const NavigationGuard: React.FC<NavigationGuardProps> = ({ 
  children, 
  requiresProfile = false,
  redirectTo = '/onboarding'
}) => {
  const { profile, checkProfileExists, isLoading } = useProfileStore()
  const [isChecking, setIsChecking] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const checkProfile = async () => {
      setIsChecking(true)
      try {
        const exists = await checkProfileExists()
        setHasProfile(exists)
      } catch (error) {
        console.error('Error checking profile:', error)
        setHasProfile(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkProfile()
  }, [checkProfileExists])

  // Show loading spinner while checking profile
  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // If profile is required but doesn't exist, redirect to onboarding
  if (requiresProfile && !hasProfile && !profile) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    )
  }

  // If profile exists but user is trying to access onboarding, redirect to dashboard
  if (location.pathname === '/onboarding' && (hasProfile || profile)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

// Higher-order component for protecting routes
export const withProfileGuard = <P extends object>(
  Component: React.ComponentType<P>,
  requiresProfile = true
) => {
  const GuardedComponent = (props: P) => (
    <NavigationGuard requiresProfile={requiresProfile}>
      <Component {...props} />
    </NavigationGuard>
  )

  GuardedComponent.displayName = `withProfileGuard(${Component.displayName || Component.name})`
  return GuardedComponent
}
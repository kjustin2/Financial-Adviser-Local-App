import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { NavigationGuard, withProfileGuard } from '../NavigationGuard'
import { useProfileStore } from '../../../stores/profileStore'
import { UserProfile } from '../../../types/profile'
import { ExperienceLevel, RiskTolerance, TimeHorizon } from '../../../types/enums'
import { MemoryRouter } from 'react-router-dom'

// Mock the profile store
vi.mock('../../../stores/profileStore')

interface MockProfileStore {
  profile: UserProfile | null
  checkProfileExists: ReturnType<typeof vi.fn>
  isLoading: boolean
}

const mockProfileStore: MockProfileStore = {
  profile: null,
  checkProfileExists: vi.fn(),
  isLoading: false
}

const TestComponent = () => <div>Protected Content</div>

const renderWithRouter = (component: React.ReactElement, initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {component}
    </MemoryRouter>
  )
}

// Helper to create a complete mock profile
const createMockProfile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  id: 'test-id',
  personalInfo: {
    name: 'Test User',
    age: 30,
    incomeRange: '$50,000-$75,000'
  },
  investmentProfile: {
    experienceLevel: ExperienceLevel.BEGINNER,
    riskTolerance: RiskTolerance.MODERATE,
    riskScore: 5,
    investmentKnowledge: []
  },
  goals: {
    primaryGoals: ['retirement'],
    timeHorizon: TimeHorizon.LONG_TERM,
    specificGoalAmounts: {}
  },
  currentSituation: {
    existingInvestments: 0,
    monthlySavings: 1000,
    emergencyFund: 5000,
    currentDebt: 0
  },
  preferences: {
    communicationStyle: 'detailed',
    updateFrequency: 'monthly'
  },
  onboardingCompleted: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  // Legacy fields
  name: 'Test User',
  age: 30,
  incomeRange: '$50,000-$75,000',
  experienceLevel: ExperienceLevel.BEGINNER,
  riskTolerance: RiskTolerance.MODERATE,
  financialGoals: ['retirement'],
  timeHorizon: TimeHorizon.LONG_TERM,
  majorPurchases: [],
  ...overrides
})

// Helper to setup mock store state
const setupMockStore = (overrides: Partial<MockProfileStore> = {}) => {
  Object.assign(mockProfileStore, {
    profile: null,
    isLoading: false,
    checkProfileExists: vi.fn().mockResolvedValue(false),
    ...overrides
  })
  vi.mocked(useProfileStore).mockReturnValue(mockProfileStore)
}

describe('NavigationGuard', () => {
  beforeEach(() => {
    // Reset mock state to default values
    mockProfileStore.profile = null
    mockProfileStore.isLoading = false
    mockProfileStore.checkProfileExists.mockClear()
    mockProfileStore.checkProfileExists.mockResolvedValue(false)
    vi.mocked(useProfileStore).mockReturnValue(mockProfileStore)
  })

  it('renders children when profile is not required', async () => {
    setupMockStore({
      profile: null,
      checkProfileExists: vi.fn().mockResolvedValue(false)
    })
    
    renderWithRouter(
      <NavigationGuard requiresProfile={false}>
        <TestComponent />
      </NavigationGuard>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })

  it('renders children when profile is required and exists', async () => {
    const mockProfile = createMockProfile()
    setupMockStore({
      profile: mockProfile,
      checkProfileExists: vi.fn().mockResolvedValue(true)
    })
    
    renderWithRouter(
      <NavigationGuard requiresProfile={true}>
        <TestComponent />
      </NavigationGuard>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })

  it('shows loading spinner while checking profile', () => {
    setupMockStore({
      isLoading: true,
      checkProfileExists: vi.fn().mockResolvedValue(false)
    })
    
    renderWithRouter(
      <NavigationGuard requiresProfile={true}>
        <TestComponent />
      </NavigationGuard>
    )
    
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('calls checkProfileExists on mount', async () => {
    const mockCheckProfile = vi.fn().mockResolvedValue(false)
    setupMockStore({
      profile: null,
      checkProfileExists: mockCheckProfile
    })
    
    renderWithRouter(
      <NavigationGuard requiresProfile={true}>
        <TestComponent />
      </NavigationGuard>
    )
    
    await waitFor(() => {
      expect(mockCheckProfile).toHaveBeenCalledTimes(1)
    })
  })

  it('renders children without profile check when requiresProfile is false', async () => {
    const mockCheckProfile = vi.fn().mockResolvedValue(false)
    setupMockStore({
      profile: null,
      isLoading: false,
      checkProfileExists: mockCheckProfile
    })
    
    renderWithRouter(
      <NavigationGuard requiresProfile={false}>
        <TestComponent />
      </NavigationGuard>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
    
    // Should still check profile even when not required (for state management)
    expect(mockCheckProfile).toHaveBeenCalled()
  })
})

describe('withProfileGuard HOC', () => {
  it('wraps component with NavigationGuard', () => {
    const WrappedComponent = withProfileGuard(TestComponent)
    
    expect(WrappedComponent.displayName).toBe('withProfileGuard(TestComponent)')
  })
})
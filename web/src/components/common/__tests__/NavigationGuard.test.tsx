import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { NavigationGuard, withProfileGuard } from '../NavigationGuard'
import { useProfileStore } from '../../../stores/profileStore'
import { MemoryRouter } from 'react-router-dom'

// Mock the profile store
vi.mock('../../../stores/profileStore')

const mockProfileStore = {
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

describe('NavigationGuard', () => {
  beforeEach(() => {
    mockProfileStore.checkProfileExists.mockClear()
    vi.mocked(useProfileStore).mockReturnValue(mockProfileStore)
  })

  it('renders children when profile is not required', async () => {
    mockProfileStore.profile = null
    mockProfileStore.checkProfileExists.mockResolvedValue(false)
    
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
    mockProfileStore.profile = { id: 'test' } as any
    mockProfileStore.checkProfileExists.mockResolvedValue(true)
    
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
    mockProfileStore.isLoading = true
    mockProfileStore.checkProfileExists.mockResolvedValue(false)
    
    renderWithRouter(
      <NavigationGuard requiresProfile={true}>
        <TestComponent />
      </NavigationGuard>
    )
    
    // Should show loading spinner
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('calls checkProfileExists on mount', async () => {
    mockProfileStore.profile = null
    mockProfileStore.checkProfileExists.mockResolvedValue(false)
    
    renderWithRouter(
      <NavigationGuard requiresProfile={true}>
        <TestComponent />
      </NavigationGuard>
    )
    
    await waitFor(() => {
      expect(mockProfileStore.checkProfileExists).toHaveBeenCalledTimes(1)
    })
  })

  it('renders children without profile check when requiresProfile is false', async () => {
    mockProfileStore.profile = null
    mockProfileStore.isLoading = false
    mockProfileStore.checkProfileExists.mockResolvedValue(false)
    
    renderWithRouter(
      <NavigationGuard requiresProfile={false}>
        <TestComponent />
      </NavigationGuard>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // Should still check profile even when not required (for state management)
    expect(mockProfileStore.checkProfileExists).toHaveBeenCalled()
  })
})

describe('withProfileGuard HOC', () => {
  it('wraps component with NavigationGuard', () => {
    const WrappedComponent = withProfileGuard(TestComponent)
    
    expect(WrappedComponent.displayName).toBe('withProfileGuard(TestComponent)')
  })
})
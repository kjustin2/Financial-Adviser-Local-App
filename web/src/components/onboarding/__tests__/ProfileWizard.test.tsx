import { render, screen, fireEvent } from '../../../test/utils'
import { testAccessibility } from '../../../test/accessibility'
import { ProfileWizard } from '../ProfileWizard'
import { useOnboardingStore } from '../../../stores/onboardingStore'

// Mock the onboarding store
vi.mock('../../../stores/onboardingStore')

const mockOnboardingStore = {
  currentStep: 1,
  totalSteps: 4,
  progress: 25,
  stepData: {
    name: 'John Doe',
    age: 30,
    incomeRange: '50k_75k',
    experienceLevel: 'intermediate',
    riskTolerance: 'moderate',
    primaryGoals: ['retirement'],
    timeHorizon: 'long_term',
    existingInvestments: 10000,
    monthlySavings: 500,
    emergencyFund: 5000
  },
  canProceedToNextStep: vi.fn(() => true),
  nextStep: vi.fn(),
  previousStep: vi.fn(),
  validateCurrentStep: vi.fn(() => true),
  errors: {}
}

describe('ProfileWizard', () => {
  const mockOnComplete = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.mocked(useOnboardingStore).mockReturnValue(mockOnboardingStore)
    mockOnComplete.mockClear()
    mockOnCancel.mockClear()
    mockOnboardingStore.nextStep.mockClear()
    mockOnboardingStore.previousStep.mockClear()
    mockOnboardingStore.validateCurrentStep.mockClear()
  })

  it('renders wizard with progress indicators', () => {
    render(<ProfileWizard onComplete={mockOnComplete} />)
    
    expect(screen.getByText('Create Your Profile')).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument()
    expect(screen.getByText('25%')).toBeInTheDocument()
  })

  it('displays step indicators with correct states', () => {
    render(<ProfileWizard onComplete={mockOnComplete} />)
    
    // Check step indicators
    expect(screen.getByText('Basic')).toBeInTheDocument()
    expect(screen.getByText('Experience')).toBeInTheDocument()
    expect(screen.getByText('Goals')).toBeInTheDocument()
    expect(screen.getByText('Situation')).toBeInTheDocument()
  })

  it('shows cancel button when onCancel is provided', () => {
    render(<ProfileWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />)
    
    const cancelButton = screen.getByText('Cancel')
    expect(cancelButton).toBeInTheDocument()
    
    fireEvent.click(cancelButton)
    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('does not show cancel button when onCancel is not provided', () => {
    render(<ProfileWizard onComplete={mockOnComplete} />)
    
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
  })

  it('disables previous button on first step', () => {
    render(<ProfileWizard onComplete={mockOnComplete} />)
    
    const previousButton = screen.getByText('Previous')
    expect(previousButton).toBeDisabled()
  })

  it('calls nextStep when next button is clicked and validation passes', () => {
    mockOnboardingStore.validateCurrentStep.mockReturnValue(true)
    render(<ProfileWizard onComplete={mockOnComplete} />)
    
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)
    
    expect(mockOnboardingStore.validateCurrentStep).toHaveBeenCalledTimes(1)
    expect(mockOnboardingStore.nextStep).toHaveBeenCalledTimes(1)
  })

  it('does not call nextStep when validation fails', () => {
    mockOnboardingStore.validateCurrentStep.mockReturnValue(false)
    render(<ProfileWizard onComplete={mockOnComplete} />)
    
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)
    
    expect(mockOnboardingStore.validateCurrentStep).toHaveBeenCalledTimes(1)
    expect(mockOnboardingStore.nextStep).not.toHaveBeenCalled()
  })

  it('calls previousStep when previous button is clicked', () => {
    const storeWithStep2 = { ...mockOnboardingStore, currentStep: 2 }
    vi.mocked(useOnboardingStore).mockReturnValue(storeWithStep2)
    
    render(<ProfileWizard onComplete={mockOnComplete} />)
    
    const previousButton = screen.getByText('Previous')
    expect(previousButton).not.toBeDisabled()
    
    fireEvent.click(previousButton)
    expect(mockOnboardingStore.previousStep).toHaveBeenCalledTimes(1)
  })

  it('shows Complete Profile button on last step', () => {
    const storeWithLastStep = { ...mockOnboardingStore, currentStep: 4, progress: 100 }
    vi.mocked(useOnboardingStore).mockReturnValue(storeWithLastStep)
    
    render(<ProfileWizard onComplete={mockOnComplete} />)
    
    expect(screen.getByText('Complete Profile')).toBeInTheDocument()
    expect(screen.queryByText('Next')).not.toBeInTheDocument()
  })

  it('calls onComplete when completing on last step', () => {
    const storeWithLastStep = { 
      ...mockOnboardingStore, 
      currentStep: 4, 
      progress: 100,
      validateCurrentStep: vi.fn(() => true)
    }
    vi.mocked(useOnboardingStore).mockReturnValue(storeWithLastStep)
    
    render(<ProfileWizard onComplete={mockOnComplete} />)
    
    const completeButton = screen.getByText('Complete Profile')
    fireEvent.click(completeButton)
    
    expect(storeWithLastStep.validateCurrentStep).toHaveBeenCalledTimes(1)
    expect(mockOnComplete).toHaveBeenCalledTimes(1)
  })

  it('displays error summary when errors exist', () => {
    const storeWithErrors = {
      ...mockOnboardingStore,
      errors: {
        name: 'Name is required',
        age: 'Please enter a valid age'
      }
    }
    vi.mocked(useOnboardingStore).mockReturnValue(storeWithErrors)
    
    render(<ProfileWizard onComplete={mockOnComplete} />)
    
    expect(screen.getByText('Please fix the following errors:')).toBeInTheDocument()
    expect(screen.getByText('• Name is required')).toBeInTheDocument()
    expect(screen.getByText('• Please enter a valid age')).toBeInTheDocument()
  })

  it('updates step titles and descriptions correctly', () => {
    // Test step 1
    render(<ProfileWizard onComplete={mockOnComplete} />)
    expect(screen.getByText('Basic Information')).toBeInTheDocument()
    expect(screen.getByText('Tell us a bit about yourself to get started')).toBeInTheDocument()

    // Test step 2
    const storeWithStep2 = { ...mockOnboardingStore, currentStep: 2 }
    vi.mocked(useOnboardingStore).mockReturnValue(storeWithStep2)
    render(<ProfileWizard onComplete={mockOnComplete} />)
    expect(screen.getByText('Investment Experience')).toBeInTheDocument()
  })

  it('is accessible', async () => {
    const { container } = render(<ProfileWizard onComplete={mockOnComplete} />)
    await testAccessibility(container)
  })

  it('has proper ARIA labels and roles', () => {
    render(<ProfileWizard onComplete={mockOnComplete} />)
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Create Your Profile')
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Basic Information')
    
    // Check for buttons
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
  })
})

import { render, screen, fireEvent } from '../../../test/utils'
import { testAccessibility } from '../../../test/accessibility'
import { WelcomeScreen } from '../WelcomeScreen'

describe('WelcomeScreen', () => {
  const mockOnStartOnboarding = vi.fn()

  beforeEach(() => {
    mockOnStartOnboarding.mockClear()
  })

  it('renders welcome screen with hero content', () => {
    render(<WelcomeScreen onStartOnboarding={mockOnStartOnboarding} />)
    
    expect(screen.getByText(/Welcome to Your Personal/)).toBeInTheDocument()
    expect(screen.getByText(/Financial Advisor/)).toBeInTheDocument()
    expect(screen.getByText(/Get personalized investment recommendations/)).toBeInTheDocument()
  })

  it('displays feature cards', () => {
    render(<WelcomeScreen onStartOnboarding={mockOnStartOnboarding} />)
    
    expect(screen.getByText('Personalized Goals')).toBeInTheDocument()
    expect(screen.getByText('Smart Analysis')).toBeInTheDocument()
    expect(screen.getByText('Risk Management')).toBeInTheDocument()
    expect(screen.getByText('Privacy First')).toBeInTheDocument()
  })

  it('shows privacy assurance section', () => {
    render(<WelcomeScreen onStartOnboarding={mockOnStartOnboarding} />)
    
    expect(screen.getByText('Your Privacy is Our Priority')).toBeInTheDocument()
    expect(screen.getByText('Local Storage Only')).toBeInTheDocument()
    expect(screen.getByText('No Registration')).toBeInTheDocument()
    expect(screen.getByText('No Data Sharing')).toBeInTheDocument()
  })

  it('calls onStartOnboarding when start button is clicked', () => {
    render(<WelcomeScreen onStartOnboarding={mockOnStartOnboarding} />)
    
    const startButtons = screen.getAllByText(/Get Started|Start Your Financial Journey/)
    fireEvent.click(startButtons[0])
    
    expect(mockOnStartOnboarding).toHaveBeenCalledTimes(1)
  })

  it('has multiple call-to-action buttons', () => {
    render(<WelcomeScreen onStartOnboarding={mockOnStartOnboarding} />)
    
    const startButtons = screen.getAllByRole('button')
    expect(startButtons).toHaveLength(2)
    
    // Test both buttons work
    fireEvent.click(startButtons[0])
    fireEvent.click(startButtons[1])
    
    expect(mockOnStartOnboarding).toHaveBeenCalledTimes(2)
  })

  it('is accessible', async () => {
    const { container } = render(<WelcomeScreen onStartOnboarding={mockOnStartOnboarding} />)
    await testAccessibility(container)
  })

  it('has proper heading hierarchy', () => {
    render(<WelcomeScreen onStartOnboarding={mockOnStartOnboarding} />)
    
    const mainHeading = screen.getByRole('heading', { level: 1 })
    expect(mainHeading).toHaveTextContent(/Welcome to Your Personal/)
    
    const subHeadings = screen.getAllByRole('heading', { level: 2 })
    expect(subHeadings).toHaveLength(5) // 4 feature cards + privacy section
  })

  it('displays icons for each feature', () => {
    const { container } = render(<WelcomeScreen onStartOnboarding={mockOnStartOnboarding} />)
    
    // Check that SVG icons are present (lucide-react icons)
    const icons = container.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThan(4) // At least one icon per feature + privacy icons
  })
})
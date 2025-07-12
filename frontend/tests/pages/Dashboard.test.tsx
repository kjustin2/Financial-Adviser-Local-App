/**
 * Comprehensive tests for Dashboard component with focus on data type safety
 * and edge case handling for API response data
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Dashboard } from '../../src/pages/Dashboard'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock the logger
vi.mock('../../src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    userAction: vi.fn(),
  }
}))

// Mock debug utilities
vi.mock('../../src/utils/debug', () => ({
  debugUtil: {
    createErrorReport: vi.fn(),
  },
  devDebug: {
    logRender: vi.fn(),
  }
}))

// Mock portfolios hook
const mockUsePortfolios = vi.fn()
vi.mock('../../src/hooks/usePortfolios', () => ({
  usePortfolios: () => mockUsePortfolios()
}))

// Mock goals hook
const mockUseGoals = vi.fn()
vi.mock('../../src/hooks/useGoals', () => ({
  useGoals: () => mockUseGoals()
}))

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set default mock returns
    mockUsePortfolios.mockReturnValue({
      data: null,
      isLoading: false,
      error: null
    })
    mockUseGoals.mockReturnValue({
      data: null,
      isLoading: false,
      error: null
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading States', () => {
    it('shows loading state when portfolios are loading', () => {
      mockUsePortfolios.mockReturnValue({
        data: null,
        isLoading: true,
        error: null
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText(/loading your portfolio data/i)).toBeInTheDocument()
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
    })

    it('shows loading state when goals are loading', () => {
      mockUseGoals.mockReturnValue({
        data: null,
        isLoading: true,
        error: null
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText(/loading your portfolio data/i)).toBeInTheDocument()
    })
  })

  describe('Error States', () => {
    it('shows error state when portfolios fail to load', () => {
      mockUsePortfolios.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Portfolio load failed')
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText(/failed to load portfolio data/i)).toBeInTheDocument()
      expect(screen.getByText(/please try refreshing the page/i)).toBeInTheDocument()
    })

    it('shows error state when goals fail to load', () => {
      mockUseGoals.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Goals load failed')
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText(/failed to load portfolio data/i)).toBeInTheDocument()
    })
  })

  describe('Data Type Safety - Goals Data', () => {
    it('handles string average_progress values correctly', () => {
      mockUseGoals.mockReturnValue({
        data: {
          goals: [],
          total_count: 0,
          total_target_amount: "0.00",
          total_current_amount: "0.00",
          average_progress: "75.5" // String value from Decimal backend
        },
        isLoading: false,
        error: null
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('75.5%')).toBeInTheDocument()
    })

    it('handles numeric average_progress values correctly', () => {
      mockUseGoals.mockReturnValue({
        data: {
          goals: [],
          total_count: 2,
          total_target_amount: 10000,
          total_current_amount: 7500,
          average_progress: 75.5 // Numeric value
        },
        isLoading: false,
        error: null
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('75.5%')).toBeInTheDocument()
      expect(screen.getByText('2 active goals')).toBeInTheDocument()
    })

    it('handles null average_progress values gracefully', () => {
      mockUseGoals.mockReturnValue({
        data: {
          goals: [],
          total_count: 0,
          total_target_amount: "0.00",
          total_current_amount: "0.00",
          average_progress: null // Null value
        },
        isLoading: false,
        error: null
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('0.0%')).toBeInTheDocument()
    })

    it('handles undefined average_progress values gracefully', () => {
      mockUseGoals.mockReturnValue({
        data: {
          goals: [],
          total_count: 0,
          total_target_amount: "0.00",
          total_current_amount: "0.00",
          // average_progress is undefined
        },
        isLoading: false,
        error: null
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('0.0%')).toBeInTheDocument()
    })

    it('handles invalid string average_progress values gracefully', () => {
      mockUseGoals.mockReturnValue({
        data: {
          goals: [],
          total_count: 0,
          total_target_amount: "0.00",
          total_current_amount: "0.00",
          average_progress: "invalid_number" // Invalid string
        },
        isLoading: false,
        error: null
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('0.0%')).toBeInTheDocument()
    })

    it('handles empty string average_progress values gracefully', () => {
      mockUseGoals.mockReturnValue({
        data: {
          goals: [],
          total_count: 0,
          total_target_amount: "0.00",
          total_current_amount: "0.00",
          average_progress: "" // Empty string
        },
        isLoading: false,
        error: null
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('0.0%')).toBeInTheDocument()
    })

    it('handles object average_progress values gracefully', () => {
      mockUseGoals.mockReturnValue({
        data: {
          goals: [],
          total_count: 0,
          total_target_amount: "0.00",
          total_current_amount: "0.00",
          average_progress: { invalid: "object" } // Object value
        },
        isLoading: false,
        error: null
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('0.0%')).toBeInTheDocument()
    })
  })

  describe('Data Type Safety - Portfolio Data', () => {
    it('handles string portfolio values correctly', () => {
      mockUsePortfolios.mockReturnValue({
        data: {
          total_value: "25000.50",
          total_gain_loss: "2500.25",
          total_return_percent: "11.5",
          portfolios_count: 3
        },
        isLoading: false,
        error: null
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('$25,000.50')).toBeInTheDocument()
      expect(screen.getByText('$2,500.25')).toBeInTheDocument()
      expect(screen.getByText('+11.5%')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('handles null portfolio values gracefully', () => {
      mockUsePortfolios.mockReturnValue({
        data: {
          total_value: null,
          total_gain_loss: null,
          total_return_percent: null,
          portfolios_count: null
        },
        isLoading: false,
        error: null
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('$0.00')).toBeInTheDocument()
      expect(screen.getByText('+0.0%')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  describe('Comprehensive Edge Cases', () => {
    it('handles completely empty API responses', () => {
      mockUseGoals.mockReturnValue({
        data: {},
        isLoading: false,
        error: null
      })
      
      mockUsePortfolios.mockReturnValue({
        data: {},
        isLoading: false,
        error: null
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Should render with fallback values
      expect(screen.getByText('$0.00')).toBeInTheDocument()
      expect(screen.getByText('0.0%')).toBeInTheDocument()
      expect(screen.getByText('0 active goals')).toBeInTheDocument()
    })

    it('handles mixed data type scenarios', () => {
      mockUseGoals.mockReturnValue({
        data: {
          goals: [],
          total_count: "2", // String number
          total_target_amount: 10000, // Numeric
          total_current_amount: "7500.50", // String decimal
          average_progress: 75.5 // Numeric
        },
        isLoading: false,
        error: null
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText('75.5%')).toBeInTheDocument()
      expect(screen.getByText('2 active goals')).toBeInTheDocument()
    })

    it('renders recent transactions section', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText(/recent transactions/i)).toBeInTheDocument()
      expect(screen.getByText(/buy aapl/i)).toBeInTheDocument()
      expect(screen.getByText(/dividend vti/i)).toBeInTheDocument()
      expect(screen.getByText(/sell msft/i)).toBeInTheDocument()
    })

    it('renders portfolio performance placeholder', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText(/portfolio performance/i)).toBeInTheDocument()
      expect(screen.getByText(/portfolio performance chart coming soon/i)).toBeInTheDocument()
    })

    it('renders goals progress section', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText(/financial goals progress/i)).toBeInTheDocument()
      expect(screen.getByText(/emergency fund/i)).toBeInTheDocument()
      expect(screen.getByText(/home down payment/i)).toBeInTheDocument()
    })
  })

  describe('Color Coding for Gains/Losses', () => {
    it('shows green for positive gains', () => {
      mockUsePortfolios.mockReturnValue({
        data: {
          total_value: 25000,
          total_gain_loss: 2500,
          total_return_percent: 11.5,
          portfolios_count: 3
        },
        isLoading: false,
        error: null
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      const gainElement = screen.getByText('$2,500.00')
      expect(gainElement).toHaveClass('text-green-600')
    })

    it('shows red for negative losses', () => {
      mockUsePortfolios.mockReturnValue({
        data: {
          total_value: 22500,
          total_gain_loss: -2500,
          total_return_percent: -10,
          portfolios_count: 3
        },
        isLoading: false,
        error: null
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      const lossElement = screen.getByText('-$2,500.00')
      expect(lossElement).toHaveClass('text-red-600')
    })
  })

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByRole('heading', { name: /dashboard/i, level: 1 })).toBeInTheDocument()
    })

    it('has accessible card titles', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      expect(screen.getByText(/total portfolio value/i)).toBeInTheDocument()
      expect(screen.getByText(/total gain\/loss/i)).toBeInTheDocument()
      expect(screen.getByText(/active portfolios/i)).toBeInTheDocument()
      expect(screen.getByText(/goal progress/i)).toBeInTheDocument()
    })
  })
})
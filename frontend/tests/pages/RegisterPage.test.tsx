/**
 * Comprehensive tests for RegisterPage component validation and error handling
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { RegisterPage } from '../../src/pages/auth/RegisterPage'
import { AuthProvider } from '../../src/contexts/AuthContext'

// Mock the logger
vi.mock('../../src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    userAction: vi.fn(),
  }
}))

// Mock the API service
const mockRegister = vi.fn()
vi.mock('../../src/contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../src/contexts/AuthContext')
  return {
    ...actual,
    useAuth: () => ({
      register: mockRegister,
      loading: false,
      isAuthenticated: false,
      user: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
    })
  }
})

// Mock react-router-dom navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
)

describe('RegisterPage', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Form Rendering', () => {
    it('renders all form fields', () => {
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      )

      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    })

    it('has proper form accessibility attributes', () => {
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('required')
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toHaveAttribute('required')
      expect(confirmPasswordInput).toHaveAttribute('type', 'password')
      expect(confirmPasswordInput).toHaveAttribute('required')
    })
  })

  describe('Real-time Validation', () => {
    it('validates email format in real-time', async () => {
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      )

      const emailInput = screen.getByLabelText(/email/i)

      // Test invalid email
      await user.type(emailInput, 'invalid-email')
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      })

      // Test valid email
      await user.clear(emailInput)
      await user.type(emailInput, 'valid@example.com')
      await waitFor(() => {
        expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument()
      })
    })

    it('validates password strength in real-time', async () => {
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      )

      const passwordInput = screen.getByLabelText(/^password$/i)

      // Test weak password
      await user.type(passwordInput, 'weak')
      await waitFor(() => {
        expect(screen.getByText(/weak/i)).toBeInTheDocument()
      })

      // Test strong password
      await user.clear(passwordInput)
      await user.type(passwordInput, 'StrongPassword123!')
      await waitFor(() => {
        expect(screen.getByText(/very strong/i)).toBeInTheDocument()
      })
    })

    it('validates password confirmation in real-time', async () => {
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      )

      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      await user.type(passwordInput, 'Password123!')
      await user.type(confirmPasswordInput, 'DifferentPassword')

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
      })

      // Test matching passwords
      await user.clear(confirmPasswordInput)
      await user.type(confirmPasswordInput, 'Password123!')
      await waitFor(() => {
        expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument()
      })\n    })\n\n    it('validates name fields in real-time', async () => {\n      render(\n        <TestWrapper>\n          <RegisterPage />\n        </TestWrapper>\n      )\n\n      const firstNameInput = screen.getByLabelText(/first name/i)\n      const lastNameInput = screen.getByLabelText(/last name/i)\n\n      // Test empty names\n      await user.type(firstNameInput, 'a')\n      await user.clear(firstNameInput)\n      await waitFor(() => {\n        expect(screen.getByText(/first name is required/i)).toBeInTheDocument()\n      })\n\n      // Test short names\n      await user.type(firstNameInput, 'a')\n      await waitFor(() => {\n        expect(screen.getByText(/first name must be at least 2 characters/i)).toBeInTheDocument()\n      })\n\n      // Test valid names\n      await user.clear(firstNameInput)\n      await user.type(firstNameInput, 'John')\n      await user.type(lastNameInput, 'Doe')\n      await waitFor(() => {\n        expect(screen.queryByText(/first name is required/i)).not.toBeInTheDocument()\n        expect(screen.queryByText(/first name must be at least 2 characters/i)).not.toBeInTheDocument()\n      })\n    })\n  })\n\n  describe('Form Submission', () => {\n    const validFormData = {\n      firstName: 'John',\n      lastName: 'Doe',\n      email: 'john.doe@example.com',\n      password: 'StrongPassword123!',\n      confirmPassword: 'StrongPassword123!'\n    }\n\n    const fillValidForm = async () => {\n      const firstNameInput = screen.getByLabelText(/first name/i)\n      const lastNameInput = screen.getByLabelText(/last name/i)\n      const emailInput = screen.getByLabelText(/email/i)\n      const passwordInput = screen.getByLabelText(/^password$/i)\n      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)\n\n      await user.type(firstNameInput, validFormData.firstName)\n      await user.type(lastNameInput, validFormData.lastName)\n      await user.type(emailInput, validFormData.email)\n      await user.type(passwordInput, validFormData.password)\n      await user.type(confirmPasswordInput, validFormData.confirmPassword)\n    }\n\n    it('submits form with valid data', async () => {\n      mockRegister.mockResolvedValueOnce({})\n\n      render(\n        <TestWrapper>\n          <RegisterPage />\n        </TestWrapper>\n      )\n\n      await fillValidForm()\n      \n      const submitButton = screen.getByRole('button', { name: /create account/i })\n      await user.click(submitButton)\n\n      await waitFor(() => {\n        expect(mockRegister).toHaveBeenCalledWith({\n          email: validFormData.email,\n          password: validFormData.password,\n          first_name: validFormData.firstName,\n          last_name: validFormData.lastName\n        })\n      })\n\n      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })\n    })\n\n    it('prevents submission with invalid data', async () => {\n      render(\n        <TestWrapper>\n          <RegisterPage />\n        </TestWrapper>\n      )\n\n      // Fill form with invalid data\n      const emailInput = screen.getByLabelText(/email/i)\n      const passwordInput = screen.getByLabelText(/^password$/i)\n      \n      await user.type(emailInput, 'invalid-email')\n      await user.type(passwordInput, 'weak')\n      \n      const submitButton = screen.getByRole('button', { name: /create account/i })\n      await user.click(submitButton)\n\n      expect(mockRegister).not.toHaveBeenCalled()\n      expect(mockNavigate).not.toHaveBeenCalled()\n    })\n\n    it('prevents submission when passwords do not match', async () => {\n      render(\n        <TestWrapper>\n          <RegisterPage />\n        </TestWrapper>\n      )\n\n      const firstNameInput = screen.getByLabelText(/first name/i)\n      const lastNameInput = screen.getByLabelText(/last name/i)\n      const emailInput = screen.getByLabelText(/email/i)\n      const passwordInput = screen.getByLabelText(/^password$/i)\n      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)\n\n      await user.type(firstNameInput, 'John')\n      await user.type(lastNameInput, 'Doe')\n      await user.type(emailInput, 'john@example.com')\n      await user.type(passwordInput, 'StrongPassword123!')\n      await user.type(confirmPasswordInput, 'DifferentPassword123!')\n      \n      const submitButton = screen.getByRole('button', { name: /create account/i })\n      await user.click(submitButton)\n\n      expect(mockRegister).not.toHaveBeenCalled()\n    })\n\n    it('shows loading state during submission', async () => {\n      // Mock a delayed response\n      mockRegister.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))\n\n      render(\n        <TestWrapper>\n          <RegisterPage />\n        </TestWrapper>\n      )\n\n      await fillValidForm()\n      \n      const submitButton = screen.getByRole('button', { name: /create account/i })\n      await user.click(submitButton)\n\n      expect(screen.getByText(/creating account/i)).toBeInTheDocument()\n      expect(submitButton).toBeDisabled()\n    })\n  })\n\n  describe('Error Handling', () => {\n    const validFormData = {\n      firstName: 'John',\n      lastName: 'Doe',\n      email: 'john.doe@example.com',\n      password: 'StrongPassword123!',\n      confirmPassword: 'StrongPassword123!'\n    }\n\n    const fillValidForm = async () => {\n      const firstNameInput = screen.getByLabelText(/first name/i)\n      const lastNameInput = screen.getByLabelText(/last name/i)\n      const emailInput = screen.getByLabelText(/email/i)\n      const passwordInput = screen.getByLabelText(/^password$/i)\n      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)\n\n      await user.type(firstNameInput, validFormData.firstName)\n      await user.type(lastNameInput, validFormData.lastName)\n      await user.type(emailInput, validFormData.email)\n      await user.type(passwordInput, validFormData.password)\n      await user.type(confirmPasswordInput, validFormData.confirmPassword)\n    }\n\n    it('displays field-specific validation errors from server', async () => {\n      const serverError = {\n        response: {\n          data: {\n            error: {\n              field_errors: {\n                email: ['A user with this email address already exists'],\n                password: ['Password does not meet requirements']\n              }\n            }\n          }\n        }\n      }\n      \n      mockRegister.mockRejectedValueOnce(serverError)\n\n      render(\n        <TestWrapper>\n          <RegisterPage />\n        </TestWrapper>\n      )\n\n      await fillValidForm()\n      \n      const submitButton = screen.getByRole('button', { name: /create account/i })\n      await user.click(submitButton)\n\n      await waitFor(() => {\n        expect(screen.getByText(/a user with this email address already exists/i)).toBeInTheDocument()\n        expect(screen.getByText(/password does not meet requirements/i)).toBeInTheDocument()\n      })\n    })\n\n    it('displays general error messages from server', async () => {\n      const serverError = {\n        response: {\n          data: {\n            error: {\n              message: 'Registration failed due to server error'\n            }\n          }\n        }\n      }\n      \n      mockRegister.mockRejectedValueOnce(serverError)\n\n      render(\n        <TestWrapper>\n          <RegisterPage />\n        </TestWrapper>\n      )\n\n      await fillValidForm()\n      \n      const submitButton = screen.getByRole('button', { name: /create account/i })\n      await user.click(submitButton)\n\n      await waitFor(() => {\n        expect(screen.getByText(/registration failed due to server error/i)).toBeInTheDocument()\n      })\n    })\n\n    it('displays generic error for unexpected errors', async () => {\n      mockRegister.mockRejectedValueOnce(new Error('Network error'))\n\n      render(\n        <TestWrapper>\n          <RegisterPage />\n        </TestWrapper>\n      )\n\n      await fillValidForm()\n      \n      const submitButton = screen.getByRole('button', { name: /create account/i })\n      await user.click(submitButton)\n\n      await waitFor(() => {\n        expect(screen.getByText(/network error/i)).toBeInTheDocument()\n      })\n    })\n\n    it('clears server errors when user starts typing', async () => {\n      const serverError = {\n        response: {\n          data: {\n            error: {\n              field_errors: {\n                email: ['A user with this email address already exists']\n              }\n            }\n          }\n        }\n      }\n      \n      mockRegister.mockRejectedValueOnce(serverError)\n\n      render(\n        <TestWrapper>\n          <RegisterPage />\n        </TestWrapper>\n      )\n\n      await fillValidForm()\n      \n      const submitButton = screen.getByRole('button', { name: /create account/i })\n      await user.click(submitButton)\n\n      await waitFor(() => {\n        expect(screen.getByText(/a user with this email address already exists/i)).toBeInTheDocument()\n      })\n\n      // Start typing in email field\n      const emailInput = screen.getByLabelText(/email/i)\n      await user.type(emailInput, 'x')\n\n      await waitFor(() => {\n        expect(screen.queryByText(/a user with this email address already exists/i)).not.toBeInTheDocument()\n      })\n    })\n  })\n\n  describe('Password Strength Indicator', () => {\n    it('shows password strength indicator', async () => {\n      render(\n        <TestWrapper>\n          <RegisterPage />\n        </TestWrapper>\n      )\n\n      const passwordInput = screen.getByLabelText(/^password$/i)\n\n      await user.type(passwordInput, 'a')\n      expect(screen.getByText(/password strength:/i)).toBeInTheDocument()\n      expect(screen.getByText(/weak/i)).toBeInTheDocument()\n\n      await user.clear(passwordInput)\n      await user.type(passwordInput, 'StrongPassword123!')\n      expect(screen.getByText(/very strong/i)).toBeInTheDocument()\n    })\n\n    it('updates strength bar visual indicator', async () => {\n      render(\n        <TestWrapper>\n          <RegisterPage />\n        </TestWrapper>\n      )\n\n      const passwordInput = screen.getByLabelText(/^password$/i)\n\n      // Test weak password\n      await user.type(passwordInput, 'weak')\n      const strengthBar = document.querySelector('.h-1\\\\.5')\n      expect(strengthBar).toHaveStyle({ width: expect.stringMatching(/\\d+%/) })\n\n      // Test strong password\n      await user.clear(passwordInput)\n      await user.type(passwordInput, 'StrongPassword123!')\n      expect(strengthBar).toHaveStyle({ width: expect.stringMatching(/\\d+%/) })\n    })\n  })\n\n  describe('Accessibility', () => {\n    it('has proper ARIA labels and roles', () => {\n      render(\n        <TestWrapper>\n          <RegisterPage />\n        </TestWrapper>\n      )\n\n      expect(screen.getByRole('form')).toBeInTheDocument()\n      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()\n      \n      // Check that all inputs have proper labels\n      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()\n      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()\n      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()\n      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()\n      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()\n    })\n\n    it('supports keyboard navigation', async () => {\n      render(\n        <TestWrapper>\n          <RegisterPage />\n        </TestWrapper>\n      )\n\n      const firstNameInput = screen.getByLabelText(/first name/i)\n      firstNameInput.focus()\n      expect(firstNameInput).toHaveFocus()\n\n      // Tab through form fields\n      await user.tab()\n      expect(screen.getByLabelText(/last name/i)).toHaveFocus()\n\n      await user.tab()\n      expect(screen.getByLabelText(/email/i)).toHaveFocus()\n\n      await user.tab()\n      expect(screen.getByLabelText(/^password$/i)).toHaveFocus()\n\n      await user.tab()\n      expect(screen.getByLabelText(/confirm password/i)).toHaveFocus()\n\n      await user.tab()\n      expect(screen.getByRole('button', { name: /create account/i })).toHaveFocus()\n    })\n  })\n\n  describe('Visual Feedback', () => {\n    it('applies error styling to invalid fields', async () => {\n      render(\n        <TestWrapper>\n          <RegisterPage />\n        </TestWrapper>\n      )\n\n      const emailInput = screen.getByLabelText(/email/i)\n      await user.type(emailInput, 'invalid-email')\n\n      await waitFor(() => {\n        expect(emailInput).toHaveClass('border-red-300')\n      })\n    })\n\n    it('applies normal styling to valid fields', async () => {\n      render(\n        <TestWrapper>\n          <RegisterPage />\n        </TestWrapper>\n      )\n\n      const emailInput = screen.getByLabelText(/email/i)\n      await user.type(emailInput, 'valid@example.com')\n\n      await waitFor(() => {\n        expect(emailInput).toHaveClass('border-gray-300')\n      })\n    })\n  })\n})
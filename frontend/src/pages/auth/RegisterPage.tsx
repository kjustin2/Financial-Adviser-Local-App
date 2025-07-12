import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { logger } from '@/utils/logger'

interface FormErrors {
  email?: string[]
  password?: string[]
  firstName?: string[]
  lastName?: string[]
  general?: string[]
}

interface ValidationState {
  email: { isValid: boolean; message: string }
  password: { isValid: boolean; message: string; strength: number }
  confirmPassword: { isValid: boolean; message: string }
  firstName: { isValid: boolean; message: string }
  lastName: { isValid: boolean; message: string }
  investmentExperience: { isValid: boolean; message: string }
  riskTolerance: { isValid: boolean; message: string }
}

export function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    investmentExperience: 'intermediate',
    riskTolerance: 'moderate',
    investmentStyle: '',
    financialGoals: [] as string[],
    netWorthRange: '',
    timeHorizon: 'long_term',
    portfolioComplexity: 'moderate'
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [validation, setValidation] = useState<ValidationState>({
    email: { isValid: true, message: '' },
    password: { isValid: true, message: '', strength: 0 },
    confirmPassword: { isValid: true, message: '' },
    firstName: { isValid: true, message: '' },
    lastName: { isValid: true, message: '' },
    investmentExperience: { isValid: true, message: '' },
    riskTolerance: { isValid: true, message: '' }
  })

  const { register } = useAuth()
  const navigate = useNavigate()

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      return { isValid: false, message: 'Email is required' }
    }
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Invalid email format' }
    }
    return { isValid: true, message: '' }
  }

  // Password validation
  const validatePassword = (password: string) => {
    if (!password) {
      return { isValid: false, message: 'Password is required', strength: 0 }
    }
    
    const errors: string[] = []
    let strength = 0

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters')
    } else {
      strength += 1
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Must contain at least one lowercase letter')
    } else {
      strength += 1
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Must contain at least one uppercase letter')
    } else {
      strength += 1
    }

    if (!/\d/.test(password)) {
      errors.push('Must contain at least one number')
    } else {
      strength += 1
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Must contain at least one special character')
    } else {
      strength += 1
    }

    return {
      isValid: errors.length === 0,
      message: errors.length > 0 ? errors[0] : '', // Show first error for simplicity
      strength
    }
  }

  // Name validation
  const validateName = (name: string, field: string) => {
    if (!name.trim()) {
      return { isValid: false, message: `${field} is required` }
    }
    if (name.trim().length < 2) {
      return { isValid: false, message: `${field} must be at least 2 characters` }
    }
    return { isValid: true, message: '' }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear server errors when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }

    // Real-time validation
    let validationResult
    switch (name) {
      case 'email':
        validationResult = validateEmail(value)
        setValidation(prev => ({ ...prev, email: validationResult }))
        break
      case 'password':
        validationResult = validatePassword(value)
        setValidation(prev => ({ ...prev, password: validationResult }))
        // Also validate confirm password if it exists
        if (formData.confirmPassword) {
          const confirmValid = value === formData.confirmPassword
          setValidation(prev => ({
            ...prev,
            confirmPassword: {
              isValid: confirmValid,
              message: confirmValid ? '' : 'Passwords do not match'
            }
          }))
        }
        break
      case 'confirmPassword':
        const confirmValid = value === formData.password
        setValidation(prev => ({
          ...prev,
          confirmPassword: {
            isValid: confirmValid,
            message: confirmValid ? '' : 'Passwords do not match'
          }
        }))
        break
      case 'firstName':
        validationResult = validateName(value, 'First name')
        setValidation(prev => ({ ...prev, firstName: validationResult }))
        break
      case 'lastName':
        validationResult = validateName(value, 'Last name')
        setValidation(prev => ({ ...prev, lastName: validationResult }))
        break
      case 'investmentExperience':
      case 'riskTolerance':
        // These are always valid since they're select dropdowns with default values
        break
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validate all fields
    const emailValidation = validateEmail(formData.email)
    const passwordValidation = validatePassword(formData.password)
    const firstNameValidation = validateName(formData.firstName, 'First name')
    const lastNameValidation = validateName(formData.lastName, 'Last name')
    const confirmPasswordValid = formData.password === formData.confirmPassword

    setValidation({
      email: emailValidation,
      password: passwordValidation,
      confirmPassword: {
        isValid: confirmPasswordValid,
        message: confirmPasswordValid ? '' : 'Passwords do not match'
      },
      firstName: firstNameValidation,
      lastName: lastNameValidation
    })

    // Check if form is valid
    if (!emailValidation.isValid || !passwordValidation.isValid || 
        !firstNameValidation.isValid || !lastNameValidation.isValid || 
        !confirmPasswordValid) {
      logger.warn('Form validation failed', 'Register', {
        email: formData.email,
        validationErrors: {
          email: !emailValidation.isValid,
          password: !passwordValidation.isValid,
          firstName: !firstNameValidation.isValid,
          lastName: !lastNameValidation.isValid,
          confirmPassword: !confirmPasswordValid
        }
      })
      return
    }

    setLoading(true)

    logger.info('Registration attempt started', 'Register', { email: formData.email })

    try {
      await register({
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        investment_experience: formData.investmentExperience,
        risk_tolerance: formData.riskTolerance,
        investment_style: formData.investmentStyle,
        financial_goals: formData.financialGoals,
        net_worth_range: formData.netWorthRange,
        time_horizon: formData.timeHorizon,
        portfolio_complexity: formData.portfolioComplexity
      })
      
      logger.info('Registration successful', 'Register', { email: formData.email })
      navigate('/', { replace: true })
    } catch (err: any) {
      logger.error('Registration attempt failed', 'Register', { email: formData.email }, err)
      
      // Handle structured API errors
      if (err?.response?.data?.error?.field_errors) {
        setErrors(err.response.data.error.field_errors)
      } else if (err?.response?.data?.error?.message) {
        setErrors({ general: [err.response.data.error.message] })
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Registration failed'
        setErrors({ general: [errorMessage] })
      }
    } finally {
      setLoading(false)
    }
  }

  // Password strength indicator
  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 1) return 'bg-red-500'
    if (strength <= 2) return 'bg-orange-500'
    if (strength <= 3) return 'bg-yellow-500'
    if (strength <= 4) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 1) return 'Weak'
    if (strength <= 2) return 'Fair'
    if (strength <= 3) return 'Good'
    if (strength <= 4) return 'Strong'
    return 'Very Strong'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create Your Investment Account
          </CardTitle>
          <p className="text-gray-600 text-center">
            Join thousands of individual investors taking control of their financial future
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {errors.general.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    !validation.firstName.isValid || errors.firstName
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {(!validation.firstName.isValid || errors.firstName) && (
                  <div className="text-sm text-red-600">
                    {errors.firstName?.[0] || validation.firstName.message}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    !validation.lastName.isValid || errors.lastName
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {(!validation.lastName.isValid || errors.lastName) && (
                  <div className="text-sm text-red-600">
                    {errors.lastName?.[0] || validation.lastName.message}
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  !validation.email.isValid || errors.email
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Enter your email"
              />
              {(!validation.email.isValid || errors.email) && (
                <div className="text-sm text-red-600">
                  {errors.email?.[0] || validation.email.message}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  !validation.password.isValid || errors.password
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Create a password"
              />
              {formData.password && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Password strength:</span>
                    <span className={`font-medium ${
                      validation.password.strength <= 2 ? 'text-red-600' :
                      validation.password.strength <= 3 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {getPasswordStrengthText(validation.password.strength)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${getPasswordStrengthColor(validation.password.strength)}`}
                      style={{ width: `${(validation.password.strength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              {(!validation.password.isValid || errors.password) && (
                <div className="text-sm text-red-600">
                  {errors.password?.[0] || validation.password.message}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  !validation.confirmPassword.isValid
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Confirm your password"
              />
              {!validation.confirmPassword.isValid && formData.confirmPassword && (
                <div className="text-sm text-red-600">
                  {validation.confirmPassword.message}
                </div>
              )}
            </div>
            
            {/* Investment Profile Section */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-medium mb-3">Investment Profile</h3>
              <p className="text-sm text-gray-600 mb-4">
                Help us personalize your experience (optional)
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="investmentExperience" className="text-sm font-medium">
                    Investment Experience
                  </label>
                  <select
                    id="investmentExperience"
                    name="investmentExperience"
                    value={formData.investmentExperience}
                    onChange={(e) => setFormData(prev => ({ ...prev, investmentExperience: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="riskTolerance" className="text-sm font-medium">
                    Risk Tolerance
                  </label>
                  <select
                    id="riskTolerance"
                    name="riskTolerance"
                    value={formData.riskTolerance}
                    onChange={(e) => setFormData(prev => ({ ...prev, riskTolerance: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="conservative">Conservative</option>
                    <option value="moderate">Moderate</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <label htmlFor="investmentStyle" className="text-sm font-medium">
                    Investment Style
                  </label>
                  <select
                    id="investmentStyle"
                    name="investmentStyle"
                    value={formData.investmentStyle}
                    onChange={(e) => setFormData(prev => ({ ...prev, investmentStyle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Style</option>
                    <option value="growth">Growth</option>
                    <option value="value">Value</option>
                    <option value="balanced">Balanced</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="netWorthRange" className="text-sm font-medium">
                    Net Worth Range
                  </label>
                  <select
                    id="netWorthRange"
                    name="netWorthRange"
                    value={formData.netWorthRange}
                    onChange={(e) => setFormData(prev => ({ ...prev, netWorthRange: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Prefer not to say</option>
                    <option value="under_100k">Under $100k</option>
                    <option value="100k_200k">$100k - $200k</option>
                    <option value="200k_500k">$200k - $500k</option>
                    <option value="500k_plus">$500k+</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <label className="text-sm font-medium">
                  Financial Goals (select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['retirement', 'growth', 'income', 'college_fund', 'emergency_fund', 'home_purchase'].map(goal => (
                    <label key={goal} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.financialGoals.includes(goal)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              financialGoals: [...prev.financialGoals, goal]
                            }))
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              financialGoals: prev.financialGoals.filter(g => g !== goal)
                            }))
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{goal.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign in
              </Link>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
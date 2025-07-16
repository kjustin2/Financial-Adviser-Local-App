import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/simple/Button'
import { Card, CardHeader, CardContent, CardTitle } from '../components/simple/Card'
import { Input } from '../components/simple/Input'
import { Select } from '../components/simple/Select'
import { useSimpleProfileStore } from '../stores/simpleProfileStore'
import type { CreateProfileData } from '../types/simple'
import { TrendingUp } from 'lucide-react'

export const SimpleOnboarding: React.FC = () => {
  const navigate = useNavigate()
  const { createProfile, isLoading } = useSimpleProfileStore()
  
  const [formData, setFormData] = useState<CreateProfileData>({
    name: '',
    age: 25,
    monthlyIncome: 0,
    monthlySavings: 0,
    monthlyExpenses: 0,
    currentDebt: 0,
    emergencyFund: 0,
    riskTolerance: 'medium'
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (formData.age < 18 || formData.age > 100) {
      newErrors.age = 'Age must be between 18 and 100'
    }
    
    if (formData.monthlyIncome <= 0) {
      newErrors.monthlyIncome = 'Monthly income must be greater than 0'
    }
    
    if (formData.monthlyExpenses < 0) {
      newErrors.monthlyExpenses = 'Monthly expenses cannot be negative'
    }
    
    if (formData.monthlySavings < 0) {
      newErrors.monthlySavings = 'Monthly savings cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await createProfile(formData)
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Failed to create profile:', error)
      setErrors({ submit: 'Failed to create profile. Please try again.' })
    }
  }

  const handleInputChange = (field: keyof CreateProfileData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const incomeOptions = [
    { value: '500', label: 'Under $500' },
    { value: '1000', label: '$500 - $1,000' },
    { value: '1500', label: '$1,000 - $1,500' },
    { value: '2000', label: '$1,500 - $2,000' },
    { value: '3000', label: '$2,000 - $3,000' },
    { value: '4000', label: '$3,000 - $4,000' },
    { value: '6000', label: '$4,000 - $6,000' },
    { value: '8000', label: '$6,000 - $8,000' },
    { value: '12000', label: '$8,000 - $12,000' },
    { value: '15000', label: 'Over $12,000' }
  ]

  const riskOptions = [
    { value: 'low', label: 'Conservative (Low Risk)' },
    { value: 'medium', label: 'Moderate (Medium Risk)' },
    { value: 'high', label: 'Aggressive (High Risk)' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to Financial Advisor
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Let's set up your profile to get personalized recommendations
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={errors.name}
                placeholder="Enter your full name"
                required
              />

              <Input
                label="Age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                error={errors.age}
                min="18"
                max="100"
                required
              />

              <Select
                label="Monthly Income"
                value={formData.monthlyIncome.toString()}
                onChange={(e) => handleInputChange('monthlyIncome', parseInt(e.target.value) || 0)}
                options={incomeOptions}
                error={errors.monthlyIncome}
                placeholder="Select your monthly income range"
                required
              />

              <Input
                label="Monthly Expenses"
                type="number"
                value={formData.monthlyExpenses}
                onChange={(e) => handleInputChange('monthlyExpenses', parseInt(e.target.value) || 0)}
                error={errors.monthlyExpenses}
                placeholder="Enter your monthly expenses"
                helperText="Include rent, food, utilities, etc."
                min="0"
                required
              />

              <Input
                label="Monthly Savings"
                type="number"
                value={formData.monthlySavings}
                onChange={(e) => handleInputChange('monthlySavings', parseInt(e.target.value) || 0)}
                error={errors.monthlySavings}
                placeholder="How much do you save each month?"
                min="0"
              />

              <Input
                label="Current Debt (Optional)"
                type="number"
                value={formData.currentDebt || ''}
                onChange={(e) => handleInputChange('currentDebt', parseInt(e.target.value) || 0)}
                placeholder="Total debt amount"
                helperText="Credit cards, loans, etc."
                min="0"
              />

              <Input
                label="Emergency Fund (Optional)"
                type="number"
                value={formData.emergencyFund || ''}
                onChange={(e) => handleInputChange('emergencyFund', parseInt(e.target.value) || 0)}
                placeholder="Current emergency savings"
                min="0"
              />

              <Select
                label="Risk Tolerance"
                value={formData.riskTolerance}
                onChange={(e) => handleInputChange('riskTolerance', e.target.value as 'low' | 'medium' | 'high')}
                options={riskOptions}
                helperText="How comfortable are you with investment risk?"
                required
              />

              {errors.submit && (
                <div className="text-sm text-red-600 text-center">
                  {errors.submit}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Profile...' : 'Create Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
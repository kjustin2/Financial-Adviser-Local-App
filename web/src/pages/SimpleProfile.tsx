import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent, CardTitle } from '../components/simple/Card'
import { Button } from '../components/simple/Button'
import { Input } from '../components/simple/Input'
import { Select } from '../components/simple/Select'
import { useSimpleProfileStore } from '../stores/simpleProfileStore'
import type { SimpleUserProfile } from '../types/simple'
import { formatCurrency } from '../utils/formatters'
import { User, Save } from 'lucide-react'

export const SimpleProfile: React.FC = () => {
  const { profile, updateProfile, isLoading } = useSimpleProfileStore()
  const [formData, setFormData] = useState<Partial<SimpleUserProfile>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isEditing, setIsEditing] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    if (profile) {
      setFormData(profile)
    }
  }, [profile])

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    )
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.age || formData.age < 18 || formData.age > 100) {
      newErrors.age = 'Age must be between 18 and 100'
    }
    
    if (!formData.monthlyIncome || formData.monthlyIncome <= 0) {
      newErrors.monthlyIncome = 'Monthly income must be greater than 0'
    }
    
    if (formData.monthlyExpenses && formData.monthlyExpenses < 0) {
      newErrors.monthlyExpenses = 'Monthly expenses cannot be negative'
    }
    
    if (formData.monthlySavings && formData.monthlySavings < 0) {
      newErrors.monthlySavings = 'Monthly savings cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    try {
      await updateProfile(formData)
      setIsEditing(false)
      setSaveMessage('Profile updated successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      console.error('Failed to update profile:', error)
      setErrors({ submit: 'Failed to update profile. Please try again.' })
    }
  }

  const handleCancel = () => {
    setFormData(profile)
    setIsEditing(false)
    setErrors({})
  }

  const handleInputChange = (field: keyof SimpleUserProfile, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }



  const riskOptions = [
    { value: 'low', label: 'Conservative (Low Risk)' },
    { value: 'medium', label: 'Moderate (Medium Risk)' },
    { value: 'high', label: 'Aggressive (High Risk)' }
  ]

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600">Manage your personal and financial information</p>
            </div>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>

        {saveMessage && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-800">{saveMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <Input
                    label="Full Name"
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={errors.name}
                    required
                  />
                  <Input
                    label="Age"
                    type="number"
                    value={formData.age || ''}
                    onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                    error={errors.age}
                    min="18"
                    max="100"
                    required
                  />
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{profile.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Age</label>
                    <p className="mt-1 text-sm text-gray-900">{profile.age} years old</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <Input
                    label="Monthly Income"
                    type="number"
                    value={formData.monthlyIncome || ''}
                    onChange={(e) => handleInputChange('monthlyIncome', parseInt(e.target.value) || 0)}
                    error={errors.monthlyIncome}
                    min="0"
                    required
                  />
                  <Input
                    label="Monthly Expenses"
                    type="number"
                    value={formData.monthlyExpenses || ''}
                    onChange={(e) => handleInputChange('monthlyExpenses', parseInt(e.target.value) || 0)}
                    error={errors.monthlyExpenses}
                    min="0"
                    required
                  />
                  <Input
                    label="Monthly Savings"
                    type="number"
                    value={formData.monthlySavings || ''}
                    onChange={(e) => handleInputChange('monthlySavings', parseInt(e.target.value) || 0)}
                    error={errors.monthlySavings}
                    min="0"
                  />
                  <Input
                    label="Current Debt"
                    type="number"
                    value={formData.currentDebt || ''}
                    onChange={(e) => handleInputChange('currentDebt', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                  <Input
                    label="Emergency Fund"
                    type="number"
                    value={formData.emergencyFund || ''}
                    onChange={(e) => handleInputChange('emergencyFund', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monthly Income</label>
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(profile.monthlyIncome)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monthly Expenses</label>
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(profile.monthlyExpenses)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monthly Savings</label>
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(profile.monthlySavings)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Debt</label>
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(profile.currentDebt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Emergency Fund</label>
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(profile.emergencyFund)}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Risk Tolerance */}
          <Card>
            <CardHeader>
              <CardTitle>Investment Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Select
                  label="Risk Tolerance"
                  value={formData.riskTolerance || 'medium'}
                  onChange={(e) => handleInputChange('riskTolerance', e.target.value as 'low' | 'medium' | 'high')}
                  options={riskOptions}
                  helperText="How comfortable are you with investment risk?"
                />
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Risk Tolerance</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">
                    {profile.riskTolerance} Risk
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Health Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Health Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Savings Rate:</span>
                <span className="text-sm font-medium">
                  {((profile.monthlySavings / profile.monthlyIncome) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Emergency Fund Coverage:</span>
                <span className="text-sm font-medium">
                  {(profile.emergencyFund / profile.monthlyExpenses).toFixed(1)} months
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Debt-to-Income Ratio:</span>
                <span className="text-sm font-medium">
                  {((profile.currentDebt / (profile.monthlyIncome * 12)) * 100).toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{errors.submit}</p>
          </div>
        )}
      </div>
  )
}
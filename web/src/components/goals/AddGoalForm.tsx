import React, { useState } from 'react'
import { Button, Input, Select, Modal, ModalFooter } from '../common'
import { GoalCategory, GoalPriority } from '../../types'
import type { CreateGoalData, UpdateGoalData, Goal } from '../../types'

interface AddGoalFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateGoalData | UpdateGoalData) => Promise<void>
  editingGoal?: Goal
  isLoading?: boolean
}

export const AddGoalForm: React.FC<AddGoalFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingGoal,
  isLoading = false
}) => {
  const isEditing = !!editingGoal

  const [formData, setFormData] = useState<CreateGoalData>({
    name: editingGoal?.name || '',
    category: editingGoal?.category || GoalCategory.CUSTOM,
    targetAmount: editingGoal?.targetAmount || 0,
    targetDate: editingGoal?.targetDate 
      ? new Date(editingGoal.targetDate).toISOString().split('T')[0] as any
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] as any,
    currentAmount: editingGoal?.currentAmount || 0,
    priority: editingGoal?.priority || GoalPriority.MEDIUM
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const goalCategories = [
    { value: GoalCategory.RETIREMENT, label: 'Retirement' },
    { value: GoalCategory.EMERGENCY, label: 'Emergency Fund' },
    { value: GoalCategory.HOUSE, label: 'House Purchase' },
    { value: GoalCategory.EDUCATION, label: 'Education' },
    { value: GoalCategory.VACATION, label: 'Vacation' },
    { value: GoalCategory.CUSTOM, label: 'Custom Goal' }
  ]

  const goalPriorities = [
    { value: GoalPriority.LOW, label: 'Low Priority' },
    { value: GoalPriority.MEDIUM, label: 'Medium Priority' },
    { value: GoalPriority.HIGH, label: 'High Priority' }
  ]

  // Preset goal suggestions
  const goalPresets = {
    [GoalCategory.EMERGENCY]: {
      name: 'Emergency Fund',
      targetAmount: 10000,
      description: '3-6 months of expenses'
    },
    [GoalCategory.RETIREMENT]: {
      name: 'Retirement Savings',
      targetAmount: 1000000,
      description: 'Build wealth for retirement'
    },
    [GoalCategory.HOUSE]: {
      name: 'House Down Payment',
      targetAmount: 60000,
      description: '20% down payment on home'
    },
    [GoalCategory.EDUCATION]: {
      name: 'Education Fund',
      targetAmount: 50000,
      description: 'College or continuing education'
    },
    [GoalCategory.VACATION]: {
      name: 'Dream Vacation',
      targetAmount: 5000,
      description: 'Special trip or experience'
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Goal name is required'
    } else if (formData.name.length > 255) {
      newErrors.name = 'Goal name must be 255 characters or less'
    }

    if (formData.targetAmount <= 0) {
      newErrors.targetAmount = 'Target amount must be greater than 0'
    }

    if (formData.currentAmount < 0) {
      newErrors.currentAmount = 'Current amount cannot be negative'
    }

    if (formData.currentAmount > formData.targetAmount) {
      newErrors.currentAmount = 'Current amount cannot exceed target amount'
    }

    if (!formData.targetDate) {
      newErrors.targetDate = 'Target date is required'
    } else {
      const targetDate = new Date(formData.targetDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (targetDate <= today) {
        newErrors.targetDate = 'Target date must be in the future'
      }
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
      const submitData = {
        ...formData,
        targetDate: new Date(formData.targetDate)
      }

      if (isEditing) {
        await onSubmit({ id: editingGoal.id, ...submitData })
      } else {
        await onSubmit(submitData)
      }
      
      handleClose()
    } catch (error) {
      console.error('Failed to save goal:', error)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      category: GoalCategory.CUSTOM,
      targetAmount: 0,
      targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] as any,
      currentAmount: 0,
      priority: GoalPriority.MEDIUM
    })
    setErrors({})
    onClose()
  }

  const handleInputChange = (field: keyof CreateGoalData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCategoryChange = (category: GoalCategory) => {
    handleInputChange('category', category)
    
    // Auto-fill name and target amount for preset categories
    if (category !== GoalCategory.CUSTOM && goalPresets[category] && !isEditing) {
      const preset = goalPresets[category]
      handleInputChange('name', preset.name)
      handleInputChange('targetAmount', preset.targetAmount)
    }
  }

  const calculateMonthlyRequired = (): number => {
    const targetDate = new Date(formData.targetDate)
    const today = new Date()
    const monthsRemaining = Math.max(1, (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
    const remainingAmount = Math.max(0, formData.targetAmount - formData.currentAmount)
    return remainingAmount / monthsRemaining
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Goal' : 'Create New Goal'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Goal Category *"
          value={formData.category}
          onChange={(value) => handleCategoryChange(value as GoalCategory)}
          options={goalCategories}
          required
        />

        <Input
          label="Goal Name *"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          error={errors.name}
          placeholder="Enter a descriptive name for your goal"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Target Amount *"
            type="number"
            step="0.01"
            min="0"
            value={formData.targetAmount}
            onChange={(e) => handleInputChange('targetAmount', parseFloat(e.target.value) || 0)}
            error={errors.targetAmount}
            placeholder="0.00"
            required
          />

          <Input
            label="Current Amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.currentAmount}
            onChange={(e) => handleInputChange('currentAmount', parseFloat(e.target.value) || 0)}
            error={errors.currentAmount}
            placeholder="0.00"
            helperText="How much have you already saved?"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Target Date *"
            type="date"
            value={formData.targetDate}
            onChange={(e) => handleInputChange('targetDate', e.target.value)}
            error={errors.targetDate}
            required
          />

          <Select
            label="Priority *"
            value={formData.priority}
            onChange={(value) => handleInputChange('priority', value as GoalPriority)}
            options={goalPriorities}
            required
          />
        </div>

        {/* Goal Analysis */}
        {formData.targetAmount > 0 && formData.targetDate && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Goal Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Remaining Amount:</span>
                <div className="font-medium">
                  ${Math.max(0, formData.targetAmount - formData.currentAmount).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Current Progress:</span>
                <div className="font-medium">
                  {formData.targetAmount > 0 ? 
                    ((formData.currentAmount / formData.targetAmount) * 100).toFixed(1) : 0}%
                </div>
              </div>
              <div>
                <span className="text-gray-600">Monthly Savings Needed:</span>
                <div className="font-medium">
                  ${calculateMonthlyRequired().toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Goal Tips */}
        {formData.category !== GoalCategory.CUSTOM && goalPresets[formData.category] && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-1">💡 Tip for {goalCategories.find(c => c.value === formData.category)?.label}</h5>
            <p className="text-sm text-blue-800">{goalPresets[formData.category].description}</p>
          </div>
        )}

        <ModalFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditing ? 'Update Goal' : 'Create Goal'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
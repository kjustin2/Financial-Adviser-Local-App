import React from 'react'
import { Card, CardContent, Button } from '../common'
import { formatCurrency, formatDate } from '../../utils/formatters'
import type { Goal, GoalCalculations } from '../../types'

interface GoalCardProps {
  goal: Goal
  calculations: GoalCalculations
  onEdit?: (goal: Goal) => void
  onDelete?: (goalId: string) => void
  onUpdateProgress?: (goalId: string, amount: number) => void
  showActions?: boolean
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  calculations,
  onEdit,
  onDelete,
  onUpdateProgress,
  showActions = true
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'retirement': return 'bg-blue-100 text-blue-800'
      case 'emergency': return 'bg-red-100 text-red-800'
      case 'house': return 'bg-green-100 text-green-800'
      case 'education': return 'bg-purple-100 text-purple-800'
      case 'vacation': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-500'
    if (percentage >= 50) return 'bg-yellow-500'
    if (percentage >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const handleQuickUpdate = () => {
    if (!onUpdateProgress) return
    
    const newAmount = prompt(
      `Update progress for ${goal.name}\n\nCurrent amount: ${formatCurrency(goal.currentAmount)}\nTarget amount: ${formatCurrency(goal.targetAmount)}\n\nEnter new current amount:`,
      goal.currentAmount.toString()
    )
    
    if (newAmount !== null) {
      const amount = parseFloat(newAmount)
      if (!isNaN(amount) && amount >= 0) {
        onUpdateProgress(goal.id, amount)
      }
    }
  }

  return (
    <Card hover className="transition-all duration-200">
      <CardContent>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-lg text-gray-900">{goal.name}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryColor(goal.category)}`}>
                {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(goal.priority)}`}>
                {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
              </span>
            </div>
          </div>

          {showActions && (onEdit || onDelete || onUpdateProgress) && (
            <div className="flex flex-col space-y-2 ml-4">
              {onUpdateProgress && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleQuickUpdate}
                >
                  Update
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(goal)}
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(goal.id)}
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{calculations.progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(calculations.progressPercentage)}`}
              style={{ width: `${Math.min(calculations.progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Goal Details */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <span className="text-gray-500">Current Amount:</span>
            <div className="font-medium">{formatCurrency(goal.currentAmount)}</div>
          </div>
          <div>
            <span className="text-gray-500">Target Amount:</span>
            <div className="font-medium">{formatCurrency(goal.targetAmount)}</div>
          </div>
          <div>
            <span className="text-gray-500">Remaining:</span>
            <div className="font-medium">{formatCurrency(calculations.remainingAmount)}</div>
          </div>
          <div>
            <span className="text-gray-500">Target Date:</span>
            <div className="font-medium">{formatDate(goal.targetDate)}</div>
          </div>
        </div>

        {/* Time and Savings Analysis */}
        <div className="bg-gray-50 p-3 rounded-lg text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <span className="text-gray-600">Time Remaining:</span>
              <div className={`font-medium ${calculations.daysRemaining < 365 ? 'text-orange-600' : 'text-gray-900'}`}>
                {calculations.daysRemaining > 0 ? (
                  calculations.daysRemaining > 365 ? 
                    `${Math.round(calculations.daysRemaining / 365)} years` :
                    `${calculations.daysRemaining} days`
                ) : (
                  <span className="text-red-600">Overdue</span>
                )}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Monthly Savings Needed:</span>
              <div className={`font-medium ${calculations.monthlyRequiredSavings > 1000 ? 'text-orange-600' : 'text-gray-900'}`}>
                {formatCurrency(calculations.monthlyRequiredSavings)}
              </div>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="mt-3 flex flex-wrap gap-2">
          {calculations.isNearCompletion && (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
              Almost Complete!
            </span>
          )}
          {calculations.isOverdue && (
            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
              Overdue
            </span>
          )}
          {calculations.daysRemaining < 365 && calculations.daysRemaining > 0 && !calculations.isNearCompletion && (
            <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded">
              Urgent
            </span>
          )}
        </div>

        {goal.updatedAt && (
          <div className="mt-3 text-xs text-gray-400">
            Last updated: {formatDate(goal.updatedAt)}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
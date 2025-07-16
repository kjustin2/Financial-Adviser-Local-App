import React, { useState } from 'react'
import { Card, CardHeader, CardContent, CardTitle } from '../components/simple/Card'
import { Button } from '../components/simple/Button'
import { Input } from '../components/simple/Input'
import { Select } from '../components/simple/Select'
import { useSimpleGoalsStore } from '../stores/simpleGoalsStore'
import { useSimpleProfileStore } from '../stores/simpleProfileStore'
import { CreateGoalData, SimpleGoal } from '../types/simple'
import { calculateGoalProgress } from '../utils/calculations'
import { formatCurrency, formatDate } from '../utils/formatters'
import { Trash2, Plus, Target } from 'lucide-react'

export const SimpleGoals: React.FC = () => {
  const { profile } = useSimpleProfileStore()
  const { addGoal, updateGoal, deleteGoal, getGoalsByUser, updateGoalProgress } = useSimpleGoalsStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SimpleGoal | null>(null)
  const [formData, setFormData] = useState<CreateGoalData>({
    type: 'emergency',
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    targetDate: new Date(),
    monthlyContribution: 0
  })

  const userGoals = profile ? getGoalsByUser(profile.id) : []

  const goalTypeOptions = [
    { value: 'emergency', label: 'Emergency Fund' },
    { value: 'retirement', label: 'Retirement' },
    { value: 'purchase', label: 'Major Purchase' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    try {
      if (editingGoal) {
        await updateGoal(editingGoal.id, formData)
        setEditingGoal(null)
      } else {
        await addGoal(profile.id, formData)
      }
      
      setFormData({
        type: 'emergency',
        name: '',
        targetAmount: 0,
        currentAmount: 0,
        targetDate: new Date(),
        monthlyContribution: 0
      })
      setShowAddForm(false)
    } catch (error) {
      console.error('Failed to save goal:', error)
    }
  }

  const handleEdit = (goal: SimpleGoal) => {
    setEditingGoal(goal)
    setFormData({
      type: goal.type,
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      targetDate: goal.targetDate,
      monthlyContribution: goal.monthlyContribution
    })
    setShowAddForm(true)
  }

  const handleDelete = async (goalId: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteGoal(goalId)
      } catch (error) {
        console.error('Failed to delete goal:', error)
      }
    }
  }

  const handleProgressUpdate = async (goalId: string, newAmount: number) => {
    try {
      await updateGoalProgress(goalId, newAmount)
      // Show success feedback could be added here if needed
    } catch (error) {
      console.error('Failed to update progress:', error)
      // Could add user-visible error message here
    }
  }

  // Use imported utilities instead of duplicating logic

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent>
            <p className="text-center text-gray-600">Please complete your profile first to set financial goals.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Goals</h1>
          <p className="text-gray-600">Track your progress toward financial milestones</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </Button>
      </div>

      {/* Add/Edit Goal Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingGoal ? 'Edit Goal' : 'Add New Goal'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Goal Type"
                  options={goalTypeOptions}
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'emergency' | 'retirement' | 'purchase' })}
                  required
                />
                <Input
                  label="Goal Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Emergency Fund, New Car"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Target Amount"
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: Number(e.target.value) })}
                  min="0"
                  step="100"
                  required
                />
                <Input
                  label="Current Amount"
                  type="number"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: Number(e.target.value) })}
                  min="0"
                  step="100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Target Date"
                  type="date"
                  value={formData.targetDate instanceof Date ? formData.targetDate.toISOString().split('T')[0] : formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: new Date(e.target.value) })}
                  required
                />
                <Input
                  label="Monthly Contribution"
                  type="number"
                  value={formData.monthlyContribution}
                  onChange={(e) => setFormData({ ...formData, monthlyContribution: Number(e.target.value) })}
                  min="0"
                  step="50"
                  helperText="How much you plan to save monthly"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  {editingGoal ? 'Update Goal' : 'Add Goal'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingGoal(null)
                    setFormData({
                      type: 'emergency',
                      name: '',
                      targetAmount: 0,
                      currentAmount: 0,
                      targetDate: new Date(),
                      monthlyContribution: 0
                    })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Goals List */}
      {userGoals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
            <p className="text-gray-600 mb-4">Start by adding your first financial goal</p>
            <Button onClick={() => setShowAddForm(true)}>
              Add Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {userGoals.map((goal) => {
            const progress = calculateGoalProgress(goal.currentAmount, goal.targetAmount)
            const isCompleted = progress >= 100
            
            return (
              <Card key={goal.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{goal.name}</h3>
                        {isCompleted && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Completed! 🎉
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 capitalize">{goal.type.replace('_', ' ')} Goal</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(goal)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(goal.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className={isCompleted ? 'text-green-600 font-medium' : 'text-gray-600'}>
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isCompleted ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{progress.toFixed(1)}% complete</span>
                      <span>Target: {formatDate(goal.targetDate)}</span>
                    </div>

                    {goal.monthlyContribution > 0 && (
                      <div className="text-sm text-gray-600">
                        Monthly contribution: {formatCurrency(goal.monthlyContribution)}
                      </div>
                    )}

                    {/* Quick progress update */}
                    <div className="flex items-center gap-2 pt-2">
                      <Input
                        type="number"
                        placeholder="Update current amount"
                        className="flex-1"
                        min="0"
                        step="100"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const newAmount = Number((e.target as HTMLInputElement).value)
                            if (newAmount >= 0) {
                              handleProgressUpdate(goal.id, newAmount)
                              ;(e.target as HTMLInputElement).value = ''
                            }
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement
                          const newAmount = Number(input.value)
                          if (newAmount >= 0) {
                            handleProgressUpdate(goal.id, newAmount)
                            input.value = ''
                          }
                        }}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
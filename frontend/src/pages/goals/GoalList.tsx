import { useState } from 'react'
import { Plus, Target, Calendar, DollarSign, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Goal {
  id: number
  name: string
  goal_type: string
  target_amount: number
  progress_percent: number
  target_date: string | null
  priority_level: number
  is_achieved: boolean
  days_remaining: number | null
}

export function GoalList() {
  const [goals] = useState<Goal[]>([
    // Mock data for now
    {
      id: 1,
      name: "Emergency Fund",
      goal_type: "emergency_fund",
      target_amount: 25000,
      progress_percent: 68.5,
      target_date: "2025-12-31",
      priority_level: 1,
      is_achieved: false,
      days_remaining: 358
    },
    {
      id: 2,
      name: "Home Down Payment",
      goal_type: "major_purchase",
      target_amount: 80000,
      progress_percent: 35.2,
      target_date: "2026-06-01",
      priority_level: 2,
      is_achieved: false,
      days_remaining: 510
    },
    {
      id: 3,
      name: "Vacation to Europe",
      goal_type: "vacation",
      target_amount: 5000,
      progress_percent: 100,
      target_date: "2024-06-01",
      priority_level: 3,
      is_achieved: true,
      days_remaining: null
    }
  ])

  const activeGoals = goals.filter(g => !g.is_achieved)
  const achievedGoals = goals.filter(g => g.is_achieved)
  const totalTargetAmount = activeGoals.reduce((sum, g) => sum + g.target_amount, 0)
  const averageProgress = activeGoals.length > 0 
    ? activeGoals.reduce((sum, g) => sum + g.progress_percent, 0) / activeGoals.length 
    : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatGoalType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 2: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 3: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 4: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 5: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getPriorityLabel = (priority: number) => {
    const labels = ['', 'High', 'Medium-High', 'Medium', 'Medium-Low', 'Low']
    return labels[priority] || 'Unknown'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Goals
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your financial goals and monitor progress
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Goals
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeGoals.length}
              </p>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Achieved
              </p>
              <p className="text-2xl font-bold text-green-600">
                {achievedGoals.length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Target
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalTargetAmount)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg Progress
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {averageProgress.toFixed(1)}%
              </p>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
      </div>

      {/* Active Goals */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Active Goals
        </h2>
        
        {activeGoals.length === 0 ? (
          <Card className="p-12 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No active goals yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Set your first financial goal to start tracking your progress
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Goal
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {activeGoals.map((goal) => (
              <Card key={goal.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {goal.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(goal.priority_level)}`}>
                        {getPriorityLabel(goal.priority_level)} Priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatGoalType(goal.goal_type)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(goal.target_amount)}
                    </p>
                    {goal.target_date && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(goal.target_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Progress
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {goal.progress_percent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(goal.progress_percent, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                  <span>
                    ${(goal.target_amount * goal.progress_percent / 100).toLocaleString()} saved
                  </span>
                  {goal.days_remaining && (
                    <span>
                      {goal.days_remaining} days remaining
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Achieved Goals */}
      {achievedGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Achieved Goals
          </h2>
          <div className="space-y-4">
            {achievedGoals.map((goal) => (
              <Card key={goal.id} className="p-6 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {goal.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatGoalType(goal.goal_type)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(goal.target_amount)}
                    </p>
                    <p className="text-sm text-green-600">
                      Goal Achieved! 🎉
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
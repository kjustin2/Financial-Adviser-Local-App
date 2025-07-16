import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardContent, CardTitle } from '../components/simple/Card'
import { Button } from '../components/simple/Button'
import { FinancialHealthDetails } from '../components/simple/FinancialHealthDetails'
import { useSimpleProfileStore } from '../stores/simpleProfileStore'
import { useSimpleGoalsStore } from '../stores/simpleGoalsStore'
import { useSimpleRecommendationsStore } from '../stores/simpleRecommendationsStore'

import { formatCurrency } from '../utils/formatters'
import { DollarSign, Target, TrendingUp, AlertCircle, Plus } from 'lucide-react'

export const SimpleDashboard: React.FC = () => {
  const { profile } = useSimpleProfileStore()
  const { getGoalsByUser } = useSimpleGoalsStore()
  const { generateRecommendations, dismissRecommendation, getRecommendationsByUser } = useSimpleRecommendationsStore()

  const userGoals = profile ? getGoalsByUser(profile.id) : []
  const userRecommendations = profile ? getRecommendationsByUser(profile.id) : []

  useEffect(() => {
    if (profile && userGoals) {
      generateRecommendations(profile, userGoals)
    }
  }, [profile, userGoals, generateRecommendations])

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    )
  }


  const totalGoalProgress = userGoals.reduce((sum, goal) => sum + (goal.currentAmount / goal.targetAmount) * 100, 0) / Math.max(userGoals.length, 1)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {getGreeting()}, {profile.name}!
              </h1>
              <p className="text-blue-100 text-lg">
                Here's your financial overview and personalized recommendations
              </p>
            </div>
            <div className="hidden md:block">
              <TrendingUp className="w-16 h-16 text-blue-200" />
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FinancialHealthDetails profile={profile} />

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
              <Target className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{userGoals.length}</div>
              <div className="flex items-center text-sm">
                <span className="text-green-600 font-medium">
                  {totalGoalProgress.toFixed(0)}% average progress
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Savings</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(profile.monthlySavings)}
              </div>
              <div className="flex items-center text-sm">
                <span className="text-gray-600">
                  {((profile.monthlySavings / profile.monthlyIncome) * 100).toFixed(1)}% of income
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        {userRecommendations.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
                  Recommendations
                </CardTitle>
                <span className="text-sm text-gray-500">
                  {userRecommendations.length} suggestions
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userRecommendations.slice(0, 3).map((rec) => (
                  <div key={rec.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="font-medium text-gray-900">{rec.title}</h4>
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {rec.priority} priority
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                        <p className="text-sm font-medium text-blue-600 mt-2">{rec.actionText}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => dismissRecommendation(rec.id)}
                        className="ml-4"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Set Financial Goals
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Define your objectives and track progress
                  </p>
                </div>
                <Link to="/goals">
                  <Button className="flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Goal
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Update Profile
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Keep your financial information current
                  </p>
                </div>
                <Link to="/profile">
                  <Button variant="outline" className="flex items-center">
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}
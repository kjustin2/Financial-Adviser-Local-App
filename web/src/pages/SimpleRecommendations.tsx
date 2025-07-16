import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardContent, CardTitle } from '../components/simple/Card'
import { Button } from '../components/simple/Button'
import { useSimpleProfileStore } from '../stores/simpleProfileStore'
import { useSimpleGoalsStore } from '../stores/simpleGoalsStore'
import { useSimpleRecommendationsStore } from '../stores/simpleRecommendationsStore'

import { Lightbulb, Filter, X, AlertCircle, CheckCircle, Clock } from 'lucide-react'

export const SimpleRecommendations: React.FC = () => {
  const { profile } = useSimpleProfileStore()
  const { getGoalsByUser } = useSimpleGoalsStore()
  const { generateRecommendations, dismissRecommendation, getRecommendationsByUser } = useSimpleRecommendationsStore()
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')

  const userGoals = profile ? getGoalsByUser(profile.id) : []
  const allRecommendations = profile ? getRecommendationsByUser(profile.id) : []

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

  // Filter recommendations based on selected filters
  const filteredRecommendations = allRecommendations.filter(rec => {
    const categoryMatch = selectedCategory === 'all' || rec.category === selectedCategory
    const priorityMatch = selectedPriority === 'all' || rec.priority === selectedPriority
    return categoryMatch && priorityMatch
  })

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'savings', label: 'Savings' },
    { value: 'debt', label: 'Debt Management' },
    { value: 'goals', label: 'Goal Achievement' },
    { value: 'risk', label: 'Risk Management' }
  ]

  const priorities = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ]

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'savings':
        return 'bg-blue-100 text-blue-800'
      case 'debt':
        return 'bg-red-100 text-red-800'
      case 'goals':
        return 'bg-purple-100 text-purple-800'
      case 'risk':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Lightbulb className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recommendations</h1>
            <p className="text-gray-600">Personalized financial advice based on your profile and goals</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {filteredRecommendations.length} of {allRecommendations.length} recommendations
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <CardTitle>Filter Recommendations</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.value)}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <div className="flex flex-wrap gap-2">
                {priorities.map(priority => (
                  <Button
                    key={priority.value}
                    variant={selectedPriority === priority.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPriority(priority.value)}
                  >
                    {priority.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations List */}
      {filteredRecommendations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {allRecommendations.length === 0 ? 'Great job!' : 'No recommendations match your filters'}
            </h3>
            <p className="text-gray-600">
              {allRecommendations.length === 0 
                ? 'Your financial health looks good. Keep up the great work!'
                : 'Try adjusting your filters to see more recommendations.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRecommendations.map((recommendation) => (
            <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getPriorityIcon(recommendation.priority)}
                      <h3 className="text-lg font-semibold text-gray-900">
                        {recommendation.title}
                      </h3>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(recommendation.priority)}`}>
                          {recommendation.priority} priority
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(recommendation.category)}`}>
                          {recommendation.category}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{recommendation.description}</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-900 mb-1">Recommended Action:</p>
                      <p className="text-sm text-blue-800">{recommendation.actionText}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dismissRecommendation(recommendation.id)}
                    className="ml-4 flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
import React, { useState } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '../common'
import { ChevronRight, AlertCircle, TrendingUp, Shield, Target, CheckCircle, X, Info } from 'lucide-react'
import type { Recommendation } from '../../types/recommendations'

export interface RecommendationsCenterProps {
  recommendations: Recommendation[]
  onImplement: (recommendationId: string) => void
  onDismiss: (recommendationId: string) => void
  onViewDetails: (recommendationId: string) => void
}

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'high':
      return <AlertCircle className="w-5 h-5 text-red-500" />
    case 'medium':
      return <TrendingUp className="w-5 h-5 text-yellow-500" />
    case 'low':
      return <Info className="w-5 h-5 text-blue-500" />
    default:
      return <Info className="w-5 h-5 text-gray-500" />
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'border-red-200 bg-red-50'
    case 'medium':
      return 'border-yellow-200 bg-yellow-50'
    case 'low':
      return 'border-blue-200 bg-blue-50'
    default:
      return 'border-gray-200 bg-gray-50'
  }
}

const getDifficultyBadge = (difficulty: string) => {
  const colors = {
    easy: 'bg-green-100 text-green-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    complex: 'bg-red-100 text-red-800'
  }
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[difficulty as keyof typeof colors] || colors.moderate}`}>
      {difficulty}
    </span>
  )
}

const RecommendationCard: React.FC<{
  recommendation: Recommendation
  onImplement: (id: string) => void
  onDismiss: (id: string) => void
  onViewDetails: (id: string) => void
}> = ({ recommendation, onImplement, onDismiss, onViewDetails }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${getPriorityColor(recommendation.priority)}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {getPriorityIcon(recommendation.priority)}
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900">
                {recommendation.title}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {recommendation.description}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getDifficultyBadge(recommendation.implementationDifficulty)}
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              recommendation.priority === 'high' 
                ? 'bg-red-100 text-red-800'
                : recommendation.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
            }`}>
              {recommendation.priority} priority
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Expected Impact */}
        {(recommendation.expectedImpact.riskReduction || 
          recommendation.expectedImpact.returnImprovement || 
          recommendation.expectedImpact.goalAcceleration) && (
          <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Expected Impact</h4>
            <div className="flex flex-wrap gap-3 text-sm">
              {recommendation.expectedImpact.riskReduction && (
                <div className="flex items-center text-green-700">
                  <Shield className="w-4 h-4 mr-1" />
                  {recommendation.expectedImpact.riskReduction}% risk reduction
                </div>
              )}
              {recommendation.expectedImpact.returnImprovement && (
                <div className="flex items-center text-blue-700">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {recommendation.expectedImpact.returnImprovement}% return improvement
                </div>
              )}
              {recommendation.expectedImpact.goalAcceleration && (
                <div className="flex items-center text-purple-700">
                  <Target className="w-4 h-4 mr-1" />
                  {recommendation.expectedImpact.goalAcceleration}% faster goal achievement
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rationale - Expandable */}
        <div className="mb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Why this recommendation?
            <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
          {isExpanded && (
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              {recommendation.rationale}
            </p>
          )}
        </div>

        {/* Action Items */}
        {recommendation.actionItems.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Action Items</h4>
            <ul className="space-y-1">
              {recommendation.actionItems.slice(0, 3).map((item) => (
                <li key={item.id} className="flex items-center text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 flex-shrink-0" />
                  {item.description}
                </li>
              ))}
              {recommendation.actionItems.length > 3 && (
                <li className="text-sm text-gray-500">
                  +{recommendation.actionItems.length - 3} more items
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(recommendation.id)}
            className="text-gray-600 hover:text-gray-900"
          >
            View Details
          </Button>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDismiss(recommendation.id)}
              className="text-gray-600 hover:text-gray-900"
            >
              <X className="w-4 h-4 mr-1" />
              Dismiss
            </Button>
            <Button
              size="sm"
              onClick={() => onImplement(recommendation.id)}
              className="bg-primary-600 hover:bg-primary-700"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Implement
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const RecommendationsCenter: React.FC<RecommendationsCenterProps> = ({
  recommendations,
  onImplement,
  onDismiss,
  onViewDetails
}) => {
  // Filter and sort recommendations
  const activeRecommendations = recommendations
    .filter(rec => rec.status === 'pending' || rec.status === 'in_progress')
    .sort((a, b) => {
      // Sort by priority (high -> medium -> low)
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }
      
      // Then by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const highPriorityCount = activeRecommendations.filter(rec => rec.priority === 'high').length
  const totalCount = activeRecommendations.length

  if (totalCount === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            All Caught Up!
          </h3>
          <p className="text-gray-600">
            You don't have any pending recommendations right now. 
            Keep up the great work with your financial planning!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Your Recommendations
          </h2>
          <p className="text-gray-600 mt-1">
            {totalCount} active recommendation{totalCount !== 1 ? 's' : ''}
            {highPriorityCount > 0 && (
              <span className="text-red-600 font-medium">
                {' '}• {highPriorityCount} high priority
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {activeRecommendations.map((recommendation) => (
          <RecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
            onImplement={onImplement}
            onDismiss={onDismiss}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  )
}
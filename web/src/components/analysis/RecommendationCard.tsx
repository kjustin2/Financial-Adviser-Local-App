import React, { useState } from 'react'
import { Card, CardContent, Button } from '../common'
import { formatDate } from '../../utils/formatters'
import type { Recommendation } from '../../types'

interface RecommendationCardProps {
  recommendation: Recommendation
  onMarkImplemented?: (recommendationId: string) => void
  onDelete?: (recommendationId: string) => void
  showActions?: boolean
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onMarkImplemented,
  onDelete,
  showActions = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'allocation': return 'bg-blue-100 text-blue-800'
      case 'rebalancing': return 'bg-purple-100 text-purple-800'
      case 'risk_management': return 'bg-orange-100 text-orange-800'
      case 'tax_efficiency': return 'bg-indigo-100 text-indigo-800'
      case 'goal_achievement': return 'bg-green-100 text-green-800'
      case 'cost_reduction': return 'bg-teal-100 text-teal-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatPriority = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()
  }

  return (
    <Card 
      className={`transition-all duration-200 ${
        recommendation.implemented ? 'opacity-75 bg-gray-50' : 'hover:shadow-md'
      }`}
    >
      <CardContent>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className={`font-semibold text-lg ${
                recommendation.implemented ? 'text-gray-600 line-through' : 'text-gray-900'
              }`}>
                {recommendation.title}
              </h3>
              {recommendation.implemented && (
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                  ✓ Implemented
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2 mb-3">
              <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(recommendation.priority)}`}>
                {formatPriority(recommendation.priority)} Priority
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(recommendation.type)}`}>
                {formatType(recommendation.type)}
              </span>
            </div>
          </div>

          {showActions && !recommendation.implemented && (onMarkImplemented || onDelete) && (
            <div className="flex flex-col space-y-2 ml-4">
              {onMarkImplemented && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMarkImplemented(recommendation.id)}
                >
                  Mark Done
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(recommendation.id)}
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-3">{recommendation.description}</p>

        {/* Reasoning - Expandable */}
        <div className="mb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="mr-1">
              {isExpanded ? '▼' : '▶'}
            </span>
            Why this matters
          </button>
          
          {isExpanded && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
              {recommendation.reasoning}
            </div>
          )}
        </div>

        {/* Action Items */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Action Items:</h4>
          <ul className="space-y-1">
            {recommendation.actionItems.map((item, index) => (
              <li key={index} className="flex items-start text-sm text-gray-700">
                <span className="inline-block w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <span>Created: {formatDate(recommendation.createdAt)}</span>
          {recommendation.implementedAt && (
            <span>Completed: {formatDate(recommendation.implementedAt)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
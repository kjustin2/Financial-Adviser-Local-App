import React, { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, Button } from '../common'
import { formatDate } from '../../utils/formatters'
import type { Recommendation } from '../../types/recommendations'
import { RecommendationType, RecommendationPriority } from '../../types/enums'

// Move helper functions outside component to prevent recreation on each render
const getPriorityColor = (priority: RecommendationPriority): string => {
  switch (priority) {
    case RecommendationPriority.HIGH: return 'bg-red-100 text-red-800 border-red-200'
    case RecommendationPriority.MEDIUM: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case RecommendationPriority.LOW: return 'bg-green-100 text-green-800 border-green-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getTypeColor = (type: RecommendationType): string => {
  switch (type) {
    case RecommendationType.ALLOCATION: return 'bg-blue-100 text-blue-800'
    case RecommendationType.REBALANCING: return 'bg-purple-100 text-purple-800'
    case RecommendationType.RISK_MANAGEMENT: return 'bg-orange-100 text-orange-800'
    case RecommendationType.TAX_EFFICIENCY: return 'bg-indigo-100 text-indigo-800'
    case RecommendationType.GOAL_ACHIEVEMENT: return 'bg-green-100 text-green-800'
    case RecommendationType.COST_REDUCTION: return 'bg-teal-100 text-teal-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const formatType = (type: RecommendationType): string => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatPriority = (priority: RecommendationPriority): string => {
  return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()
}

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

  // Memoize computed values to prevent unnecessary recalculations
  const priorityColorClass = useMemo(() => getPriorityColor(recommendation.priority), [recommendation.priority])
  const typeColorClass = useMemo(() => getTypeColor(recommendation.type), [recommendation.type])
  const formattedType = useMemo(() => formatType(recommendation.type), [recommendation.type])
  const formattedPriority = useMemo(() => formatPriority(recommendation.priority), [recommendation.priority])
  const formattedCreatedDate = useMemo(() => formatDate(recommendation.createdAt), [recommendation.createdAt])
  const formattedImplementedDate = useMemo(() => 
    recommendation.implementedAt ? formatDate(recommendation.implementedAt) : null, 
    [recommendation.implementedAt]
  )

  // Memoize event handlers to prevent unnecessary re-renders of child components
  const handleToggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])

  const handleMarkImplemented = useCallback(() => {
    onMarkImplemented?.(recommendation.id)
  }, [onMarkImplemented, recommendation.id])

  const handleDelete = useCallback(() => {
    onDelete?.(recommendation.id)
  }, [onDelete, recommendation.id])

  // Memoize the card className to prevent unnecessary recalculations
  const cardClassName = useMemo(() => 
    `transition-all duration-200 ${
      recommendation.implemented ? 'opacity-75 bg-gray-50' : 'hover:shadow-md'
    }`,
    [recommendation.implemented]
  )

  // Memoize the title className
  const titleClassName = useMemo(() => 
    `font-semibold text-lg ${
      recommendation.implemented ? 'text-gray-600 line-through' : 'text-gray-900'
    }`,
    [recommendation.implemented]
  )

  return (
    <Card className={cardClassName}>
      <CardContent>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className={titleClassName}>
                {recommendation.title}
              </h3>
              {recommendation.implemented && (
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                  ✓ Implemented
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2 mb-3">
              <span className={`px-2 py-1 text-xs font-medium rounded border ${priorityColorClass}`}>
                {formattedPriority} Priority
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded ${typeColorClass}`}>
                {formattedType}
              </span>
            </div>
          </div>

          {showActions && !recommendation.implemented && (onMarkImplemented || onDelete) && (
            <div className="flex flex-col space-y-2 ml-4">
              {onMarkImplemented && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkImplemented}
                >
                  Mark Done
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
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
            onClick={handleToggleExpanded}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            aria-expanded={isExpanded}
            aria-controls="reasoning-content"
          >
            <span className="mr-1" aria-hidden="true">
              {isExpanded ? '▼' : '▶'}
            </span>
            Why this matters
          </button>
          
          {isExpanded && (
            <div 
              id="reasoning-content"
              className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700"
            >
              {recommendation.reasoning}
            </div>
          )}
        </div>

        {/* Action Items */}
        {recommendation.actionItems.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Action Items:</h4>
            <ul className="space-y-1" role="list">
              {recommendation.actionItems.map((item) => (
                <li key={item.id} className="flex items-start text-sm text-gray-700">
                  <span className="inline-block w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0" aria-hidden="true" />
                  <span>{item.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <span>Created: {formattedCreatedDate}</span>
          {formattedImplementedDate && (
            <span>Completed: {formattedImplementedDate}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
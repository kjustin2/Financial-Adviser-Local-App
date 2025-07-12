import { AlertCircle, CheckCircle, Lightbulb, TrendingUp, Shield, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRecommendations, type Recommendation } from '@/hooks/useRecommendations'

const priorityConfig = {
  high: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  medium: {
    icon: TrendingUp,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  low: {
    icon: Lightbulb,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  }
}

const typeIcons = {
  asset_allocation: Target,
  rebalancing: TrendingUp,
  risk_adjustment: Shield,
  goal_alignment: Target,
  diversification: Lightbulb,
  tax_optimization: CheckCircle
}

interface RecommendationItemProps {
  recommendation: Recommendation
}

function RecommendationItem({ recommendation }: RecommendationItemProps) {
  const config = priorityConfig[recommendation.priority]
  const TypeIcon = typeIcons[recommendation.type as keyof typeof typeIcons] || Lightbulb
  const PriorityIcon = config.icon

  return (
    <div className={`border rounded-lg p-4 ${config.borderColor} ${config.bgColor}`}>
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 ${config.color}`}>
          <PriorityIcon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <TypeIcon className="h-4 w-4 text-gray-500" />
            <h4 className="text-sm font-medium text-gray-900">{recommendation.title}</h4>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color} ${config.bgColor}`}>
              {recommendation.priority}
            </span>
          </div>
          <p className="text-sm text-gray-700 mb-2">{recommendation.description}</p>
          <p className="text-xs text-gray-600 mb-2">
            <strong>Action:</strong> {recommendation.action}
          </p>
          {recommendation.estimated_impact && (
            <p className="text-xs text-gray-600 mb-2">
              <strong>Impact:</strong> {recommendation.estimated_impact}
            </p>
          )}
          <p className="text-xs text-gray-500">
            <strong>Why:</strong> {recommendation.reason}
          </p>
        </div>
      </div>
    </div>
  )
}

export function RecommendationsCard() {
  const { data: recommendationsData, isLoading, error } = useRecommendations()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Investment Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Recommendations Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">
            Unable to load recommendations. Please try again later.
          </p>
        </CardContent>
      </Card>
    )
  }

  const recommendations = recommendationsData?.recommendations || []
  const totalCount = recommendationsData?.total_count || 0
  const highPriorityCount = recommendationsData?.high_priority_count || 0

  if (totalCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Investment Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All Set!</h3>
            <p className="text-gray-600 text-sm">
              Your portfolio appears well-balanced. We'll notify you when we have new recommendations.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show top 3 recommendations in the dashboard card
  const topRecommendations = recommendations.slice(0, 3)
  const hasMoreRecommendations = totalCount > 3

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Investment Recommendations
          </div>
          <div className="flex items-center space-x-2">
            {highPriorityCount > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-red-600 bg-red-50">
                {highPriorityCount} urgent
              </span>
            )}
            <span className="text-sm text-gray-500">{totalCount} total</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topRecommendations.map((recommendation, index) => (
            <RecommendationItem key={index} recommendation={recommendation} />
          ))}
          
          {hasMoreRecommendations && (
            <div className="text-center pt-4">
              <Button variant="outline" size="sm">
                View All {totalCount} Recommendations →
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
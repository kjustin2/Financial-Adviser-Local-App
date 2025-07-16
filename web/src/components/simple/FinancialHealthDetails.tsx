import React, { useState } from 'react'
import { Card, CardHeader, CardContent, CardTitle } from './Card'
import { Button } from './Button'
import { calculateFinancialHealthBreakdown } from '../../utils/calculations'
import type { SimpleUserProfile } from '../../types/simple'
import { TrendingUp, ChevronDown, ChevronUp, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

interface FinancialHealthDetailsProps {
  profile: SimpleUserProfile
}

export const FinancialHealthDetails: React.FC<FinancialHealthDetailsProps> = ({ profile }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const breakdown = calculateFinancialHealthBreakdown(profile)

  const getStatusIcon = (status: 'excellent' | 'good' | 'fair' | 'poor') => {
    switch (status) {
      case 'excellent':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'good':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'fair':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'poor':
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: 'excellent' | 'good' | 'fair' | 'poor') => {
    switch (status) {
      case 'excellent':
        return 'text-green-600'
      case 'good':
        return 'text-blue-600'
      case 'fair':
        return 'text-yellow-600'
      case 'poor':
        return 'text-red-600'
    }
  }

  const getProgressBarColor = (status: 'excellent' | 'good' | 'fair' | 'poor') => {
    switch (status) {
      case 'excellent':
        return 'bg-green-500'
      case 'good':
        return 'bg-blue-500'
      case 'fair':
        return 'bg-yellow-500'
      case 'poor':
        return 'bg-red-500'
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Financial Health</CardTitle>
        <TrendingUp className="h-4 w-4 text-gray-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-2">
          {breakdown.totalScore}/100
        </div>
        <div className="flex items-center text-sm mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                breakdown.totalScore >= 80 ? 'bg-green-500' :
                breakdown.totalScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${breakdown.totalScore}%` }}
            />
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2"
        >
          {isExpanded ? 'Hide Details' : 'Show Details'}
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            {/* Score Breakdown */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Score Breakdown</h4>
              
              {Object.entries(breakdown.components).map(([key, component]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(component.status)}
                      <span className="text-sm font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${getStatusColor(component.status)}`}>
                      {component.score}/{component.maxScore}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${getProgressBarColor(component.status)}`}
                      style={{ width: `${(component.score / component.maxScore) * 100}%` }}
                    />
                  </div>
                  
                  <p className="text-xs text-gray-600">{component.description}</p>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            {breakdown.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Improvement Suggestions</h4>
                <ul className="space-y-1">
                  {breakdown.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
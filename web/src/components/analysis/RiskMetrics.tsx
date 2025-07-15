import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../common'
import type { RiskMetrics } from '../../types'

interface RiskMetricsProps {
  riskMetrics: RiskMetrics
}

export const RiskMetricsComponent: React.FC<RiskMetricsProps> = ({ riskMetrics }) => {
  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getScoreColor = (score: number, isReverse = false) => {
    if (isReverse) {
      // For concentration risk - lower is better
      if (score <= 20) return 'text-green-600'
      if (score <= 40) return 'text-yellow-600'
      return 'text-red-600'
    } else {
      // For diversification - higher is better
      if (score >= 75) return 'text-green-600'
      if (score >= 50) return 'text-yellow-600'
      return 'text-red-600'
    }
  }

  const formatRiskLevel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1).toLowerCase()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Risk Level */}
          <div className="text-center">
            <div className="mb-2">
              <span className="text-sm text-gray-600">Overall Risk Level</span>
            </div>
            <div className={`inline-flex px-4 py-2 rounded-full text-lg font-semibold ${getRiskLevelColor(riskMetrics.riskLevel)}`}>
              {formatRiskLevel(riskMetrics.riskLevel)} Risk
            </div>
          </div>

          {/* Risk Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Diversification Score */}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold mb-1">
                <span className={getScoreColor(riskMetrics.diversificationScore)}>
                  {riskMetrics.diversificationScore.toFixed(0)}
                </span>
                <span className="text-gray-400 text-lg">/100</span>
              </div>
              <div className="text-sm text-gray-600">Diversification Score</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    riskMetrics.diversificationScore >= 75 ? 'bg-green-500' :
                    riskMetrics.diversificationScore >= 50 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${riskMetrics.diversificationScore}%` }}
                />
              </div>
            </div>

            {/* Concentration Risk */}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold mb-1">
                <span className={getScoreColor(riskMetrics.concentrationRisk, true)}>
                  {riskMetrics.concentrationRisk.toFixed(1)}%
                </span>
              </div>
              <div className="text-sm text-gray-600">Concentration Risk</div>
              <div className="text-xs text-gray-500 mt-1">
                (Largest holding %)
              </div>
            </div>

            {/* Volatility Score */}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold mb-1">
                <span className={getScoreColor(riskMetrics.volatilityScore)}>
                  {riskMetrics.volatilityScore.toFixed(0)}
                </span>
                <span className="text-gray-400 text-lg">/100</span>
              </div>
              <div className="text-sm text-gray-600">Volatility Score</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${riskMetrics.volatilityScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Risk Interpretation */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Risk Assessment Summary</h4>
            <div className="text-sm text-blue-800 space-y-2">
              {riskMetrics.riskLevel === 'LOW' && (
                <p>Your portfolio has a conservative risk profile with emphasis on stability and capital preservation.</p>
              )}
              {riskMetrics.riskLevel === 'MEDIUM' && (
                <p>Your portfolio has a balanced risk profile with a mix of growth potential and stability.</p>
              )}
              {riskMetrics.riskLevel === 'HIGH' && (
                <p>Your portfolio has an aggressive risk profile focused on growth potential with higher volatility.</p>
              )}
              
              {riskMetrics.diversificationScore < 50 && (
                <p>• Consider improving diversification by adding different asset types or sectors.</p>
              )}
              
              {riskMetrics.concentrationRisk > 30 && (
                <p>• Your portfolio may be too concentrated in a single holding. Consider rebalancing.</p>
              )}
              
              {riskMetrics.volatilityScore > 70 && (
                <p>• High volatility detected. Ensure this aligns with your risk tolerance and time horizon.</p>
              )}
            </div>
          </div>

          {/* Risk Level Guidelines */}
          <div className="border-t pt-4">
            <h5 className="font-medium text-gray-900 mb-3">Risk Level Guidelines</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="p-3 border border-green-200 rounded-lg">
                <div className="font-medium text-green-800 mb-1">Low Risk</div>
                <div className="text-green-700">
                  Suitable for conservative investors seeking capital preservation with minimal volatility.
                </div>
              </div>
              <div className="p-3 border border-yellow-200 rounded-lg">
                <div className="font-medium text-yellow-800 mb-1">Medium Risk</div>
                <div className="text-yellow-700">
                  Balanced approach suitable for moderate investors with medium-term goals.
                </div>
              </div>
              <div className="p-3 border border-red-200 rounded-lg">
                <div className="font-medium text-red-800 mb-1">High Risk</div>
                <div className="text-red-700">
                  Growth-focused approach for aggressive investors with long time horizons.
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
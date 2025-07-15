import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../common'
import { formatCurrency, formatGainLoss, formatGainLossPercentage } from '../../utils/formatters'
import type { PortfolioSummary, PortfolioAnalysis } from '../../types'

interface PortfolioSummaryProps {
  summary: PortfolioSummary
  analysis?: PortfolioAnalysis
}

export const PortfolioSummaryComponent: React.FC<PortfolioSummaryProps> = ({ summary, analysis }) => {
  const gainLoss = formatGainLoss(summary.totalGainLoss)
  const gainLossPercent = formatGainLossPercentage(summary.totalGainLossPercent)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Value */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.totalValue)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Gain/Loss */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Gain/Loss</p>
              <p className={`text-2xl font-bold ${gainLoss.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {gainLoss.text}
              </p>
              <p className={`text-sm ${gainLoss.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {gainLossPercent.text}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Cost Basis */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cost Basis</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.totalCostBasis)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Holdings Count */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Holdings</p>
              <p className="text-2xl font-bold text-gray-900">{summary.holdingsCount}</p>
              <p className="text-sm text-gray-500">
                {summary.holdingsCount === 1 ? 'position' : 'positions'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asset Allocation */}
      {analysis && analysis.allocations.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.allocations.map((allocation) => (
                <div key={allocation.securityType} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: 
                          allocation.securityType === 'STOCK' ? '#3B82F6' :
                          allocation.securityType === 'BOND' ? '#10B981' :
                          allocation.securityType === 'ETF' ? '#F59E0B' :
                          allocation.securityType === 'CASH' ? '#6B7280' :
                          '#8B5CF6'
                      }}
                    />
                    <span className="text-sm font-medium capitalize">
                      {allocation.securityType.toLowerCase().replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-500">({allocation.count})</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{allocation.percentage.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">{formatCurrency(allocation.value)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Highlights */}
      {analysis && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Performance Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.topPerformers.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-green-600 mb-2">Top Performers</h4>
                  <div className="space-y-1">
                    {analysis.topPerformers.slice(0, 3).map((holding) => {
                      const metrics = PortfolioAnalytics.calculateHoldingMetrics(holding)
                      const gainLossPercent = formatGainLossPercentage(metrics.unrealizedGainLossPercent)
                      return (
                        <div key={holding.id} className="flex justify-between text-sm">
                          <span>{holding.symbol}</span>
                          <span className="text-green-600">{gainLossPercent.text}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {analysis.worstPerformers.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-red-600 mb-2">Needs Attention</h4>
                  <div className="space-y-1">
                    {analysis.worstPerformers.slice(0, 3).map((holding) => {
                      const metrics = PortfolioAnalytics.calculateHoldingMetrics(holding)
                      const gainLossPercent = formatGainLossPercentage(metrics.unrealizedGainLossPercent)
                      return (
                        <div key={holding.id} className="flex justify-between text-sm">
                          <span>{holding.symbol}</span>
                          <span className="text-red-600">{gainLossPercent.text}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
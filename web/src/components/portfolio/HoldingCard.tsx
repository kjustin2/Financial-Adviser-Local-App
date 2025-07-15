import React from 'react'
import { Card, CardContent, Button } from '../common'
import { formatCurrency, formatGainLoss, formatGainLossPercentage, formatDate, formatSecurityType } from '../../utils/formatters'
import { PortfolioAnalytics } from '../../services/analytics'
import type { Holding } from '../../types'

interface HoldingCardProps {
  holding: Holding
  onEdit?: (holding: Holding) => void
  onDelete?: (holdingId: string) => void
  showActions?: boolean
}

export const HoldingCard: React.FC<HoldingCardProps> = ({
  holding,
  onEdit,
  onDelete,
  showActions = true
}) => {
  const metrics = PortfolioAnalytics.calculateHoldingMetrics(holding)
  const gainLoss = formatGainLoss(metrics.unrealizedGainLoss)
  const gainLossPercent = formatGainLossPercentage(metrics.unrealizedGainLossPercent)

  return (
    <Card hover className="transition-all duration-200">
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-lg text-gray-900">{holding.symbol}</h3>
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                {formatSecurityType(holding.securityType)}
              </span>
            </div>
            
            {holding.securityName && (
              <p className="text-sm text-gray-600 mb-3">{holding.securityName}</p>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Quantity:</span>
                <div className="font-medium">{holding.quantity.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-gray-500">Current Price:</span>
                <div className="font-medium">
                  {formatCurrency(holding.currentPrice || holding.purchasePrice)}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Purchase Price:</span>
                <div className="font-medium">{formatCurrency(holding.purchasePrice)}</div>
              </div>
              <div>
                <span className="text-gray-500">Purchase Date:</span>
                <div className="font-medium">{formatDate(holding.purchaseDate)}</div>
              </div>
            </div>
          </div>

          {showActions && (onEdit || onDelete) && (
            <div className="flex flex-col space-y-2 ml-4">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(holding)}
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(holding.id)}
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total Cost:</span>
              <div className="font-medium">{formatCurrency(metrics.totalCostBasis)}</div>
            </div>
            <div>
              <span className="text-gray-500">Current Value:</span>
              <div className="font-medium">{formatCurrency(metrics.currentValue)}</div>
            </div>
            <div>
              <span className="text-gray-500">Gain/Loss:</span>
              <div className={`font-medium ${gainLoss.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                <div>{gainLoss.text}</div>
                <div className="text-xs">({gainLossPercent.text})</div>
              </div>
            </div>
          </div>
        </div>

        {holding.lastUpdated && (
          <div className="mt-3 text-xs text-gray-400">
            Last updated: {formatDate(holding.lastUpdated)}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
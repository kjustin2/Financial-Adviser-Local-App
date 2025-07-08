import { useState } from 'react'
import { Plus, PieChart, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Portfolio {
  id: number
  name: string
  portfolio_type: string
  current_value: number
  unrealized_gain_loss: number
  unrealized_return_percent: number
  holdings_count: number
  last_updated: string
}

export function PortfolioList() {
  const [portfolios] = useState<Portfolio[]>([
    // Mock data for now
    {
      id: 1,
      name: "Growth Portfolio",
      portfolio_type: "investment",
      current_value: 125000,
      unrealized_gain_loss: 15000,
      unrealized_return_percent: 13.6,
      holdings_count: 8,
      last_updated: "2025-01-07T10:30:00Z"
    },
    {
      id: 2,
      name: "Retirement 401k",
      portfolio_type: "retirement",
      current_value: 75000,
      unrealized_gain_loss: -2500,
      unrealized_return_percent: -3.2,
      holdings_count: 5,
      last_updated: "2025-01-07T10:30:00Z"
    }
  ])

  const totalValue = portfolios.reduce((sum, p) => sum + p.current_value, 0)
  const totalGainLoss = portfolios.reduce((sum, p) => sum + p.unrealized_gain_loss, 0)
  const totalReturnPercent = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Portfolios
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your investment portfolios and track performance
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Portfolio
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Value
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalValue)}
              </p>
            </div>
            <PieChart className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Gain/Loss
              </p>
              <p className={`text-2xl font-bold ${
                totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(totalGainLoss)}
              </p>
            </div>
            {totalGainLoss >= 0 ? (
              <TrendingUp className="h-8 w-8 text-green-600" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-600" />
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Return
              </p>
              <p className={`text-2xl font-bold ${
                totalReturnPercent >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatPercent(totalReturnPercent)}
              </p>
            </div>
            {totalReturnPercent >= 0 ? (
              <TrendingUp className="h-8 w-8 text-green-600" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-600" />
            )}
          </div>
        </Card>
      </div>

      {/* Portfolio List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Your Portfolios
        </h2>
        
        {portfolios.length === 0 ? (
          <Card className="p-12 text-center">
            <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No portfolios yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Get started by creating your first investment portfolio
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Portfolio
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {portfolios.map((portfolio) => (
              <Card key={portfolio.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {portfolio.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {portfolio.portfolio_type.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(portfolio.current_value)}
                    </p>
                    <p className={`text-sm ${
                      portfolio.unrealized_gain_loss >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(portfolio.unrealized_gain_loss)} ({formatPercent(portfolio.unrealized_return_percent)})
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                  <span>{portfolio.holdings_count} holdings</span>
                  <span>
                    Updated {new Date(portfolio.last_updated).toLocaleDateString()}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
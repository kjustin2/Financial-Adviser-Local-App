import { Plus, PieChart, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { usePortfolios } from '@/hooks/usePortfolios'
import { CreatePortfolioModal } from '@/components/portfolios/CreatePortfolioModal'

export function PortfolioList() {
  const { data: portfolioData, isLoading, error } = usePortfolios()
  
  const portfolios = portfolioData?.portfolios || []

  const totalValue = portfolioData?.total_value || 0
  const totalGainLoss = portfolioData?.total_gain_loss || 0
  const totalReturnPercent = portfolioData?.total_return_percent || 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Portfolios
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Loading your portfolios...
            </p>
          </div>
          <CreatePortfolioModal>
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              Add Portfolio
            </Button>
          </CreatePortfolioModal>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Portfolios
            </h1>
          </div>
          <CreatePortfolioModal />
        </div>
        <Card className="border-red-200">
          <div className="flex items-center space-x-2 p-6">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-red-800 font-medium">Failed to load portfolios</p>
              <p className="text-red-600 text-sm">Please try refreshing the page or contact support if the issue persists.</p>
            </div>
          </div>
        </Card>
      </div>
    )
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
        <CreatePortfolioModal />
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
            <CreatePortfolioModal>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Portfolio
              </Button>
            </CreatePortfolioModal>
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
                  <span>{(portfolio as any).holdings_count || 0} holdings</span>
                  <span>
                    {(portfolio as any).last_updated ? 
                      `Updated ${new Date((portfolio as any).last_updated).toLocaleDateString()}` :
                      'Recently created'
                    }
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
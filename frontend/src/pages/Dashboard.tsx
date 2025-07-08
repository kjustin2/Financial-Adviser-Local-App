import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, PieChart, Target, DollarSign } from 'lucide-react'

export function Dashboard() {
  // Mock data - would come from API in real app
  const mockData = {
    totalValue: 200000,
    totalGainLoss: 12500,
    totalReturnPercent: 6.7,
    portfoliosCount: 3,
    goalsCount: 4,
    goalsProgress: 65.2,
    recentTransactions: [
      { id: 1, type: 'Buy', symbol: 'AAPL', amount: 1500, date: '2025-01-06' },
      { id: 2, type: 'Dividend', symbol: 'VTI', amount: 125, date: '2025-01-05' },
      { id: 3, type: 'Sell', symbol: 'MSFT', amount: 2200, date: '2025-01-04' },
    ]
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your financial portfolio
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockData.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercent(mockData.totalReturnPercent)} from cost basis
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
            {mockData.totalGainLoss >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${mockData.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(mockData.totalGainLoss)}
            </div>
            <p className="text-xs text-muted-foreground">
              Since inception
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Portfolios</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.portfoliosCount}</div>
            <p className="text-xs text-muted-foreground">
              Across different strategies
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goal Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.goalsProgress.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {mockData.goalsCount} active goals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Portfolio performance chart coming soon</p>
                <p className="text-sm">Will show your investment performance over time</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      transaction.type === 'Buy' ? 'bg-green-500' :
                      transaction.type === 'Sell' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">
                        {transaction.type} {transaction.symbol}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              ))}
              <div className="text-center pt-4">
                <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">
                  View all transactions →
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Financial Goals Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Mock goal progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Emergency Fund</span>
                <span>68.5%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68.5%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Home Down Payment</span>
                <span>35.2%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '35.2%' }}></div>
              </div>
            </div>
            <div className="text-center pt-4">
              <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">
                View all goals →
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, TrendingUp, TrendingDown, Activity, PieChart, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { HoldingsList } from '@/components/holdings/HoldingsList'
import { TransactionsList } from '@/components/transactions/TransactionsList'
import { CreateTransactionModal } from '@/components/transactions/CreateTransactionModal'
import { portfolioApi } from '@/services/portfolioApi'
import { holdingApi } from '@/services/holdingApi'
import { transactionApi } from '@/services/transactionApi'

export function PortfolioDetails() {
  const { portfolioId } = useParams<{ portfolioId: string }>()
  const navigate = useNavigate()
  const [showCreateTransactionModal, setShowCreateTransactionModal] = useState(false)
  const [activeTab, setActiveTab] = useState('holdings')

  const portfolioIdNum = portfolioId ? parseInt(portfolioId) : undefined

  // Fetch portfolio details
  const { data: portfolio, isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolio', portfolioIdNum],
    queryFn: () => portfolioApi.getPortfolio(portfolioIdNum!),
    enabled: !!portfolioIdNum,
  })

  // Fetch holdings for this portfolio
  const { data: holdingsData } = useQuery({
    queryKey: ['holdings', portfolioIdNum],
    queryFn: () => holdingApi.getHoldings(portfolioIdNum),
    enabled: !!portfolioIdNum,
  })

  // Fetch recent transactions for this portfolio
  const { data: recentTransactions } = useQuery({
    queryKey: ['transactions', portfolioIdNum, 'recent'],
    queryFn: () => transactionApi.getPortfolioTransactions(portfolioIdNum!, 0, 5),
    enabled: !!portfolioIdNum,
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`
  }

  if (portfolioLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/portfolios')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portfolios
          </Button>
        </div>
        <div className="text-center py-12">Loading portfolio details...</div>
      </div>
    )
  }

  if (!portfolio) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/portfolios')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portfolios
          </Button>
        </div>
        <div className="text-center py-12 text-red-600">
          Portfolio not found or access denied.
        </div>
      </div>
    )
  }

  const totalValue = holdingsData?.total_value || 0
  const totalCostBasis = holdingsData?.total_cost_basis || 0
  const totalUnrealizedGainLoss = holdingsData?.total_unrealized_gain_loss || 0
  const returnPercent = totalCostBasis > 0 ? (totalUnrealizedGainLoss / totalCostBasis) * 100 : 0

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/portfolios')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portfolios
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{portfolio.name}</h1>
            <p className="text-muted-foreground">
              {portfolio.description || 'Portfolio details and management'}
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreateTransactionModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <Badge 
              variant="secondary" 
              className="mt-1 text-xs"
            >
              {portfolio.portfolio_type?.replace('_', ' ').toUpperCase()}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Basis</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCostBasis)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Original investment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unrealized P&L</CardTitle>
            {totalUnrealizedGainLoss >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              totalUnrealizedGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(totalUnrealizedGainLoss)}
            </div>
            <p className={`text-xs mt-1 ${
              totalUnrealizedGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatPercent(returnPercent)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Holdings Count</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{holdingsData?.total_count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active positions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Card */}
      {recentTransactions && recentTransactions.transactions.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentTransactions.transactions.slice(0, 3).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant={transaction.type === 'buy' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {transaction.type.toUpperCase()}
                    </Badge>
                    <span className="font-medium">{transaction.symbol}</span>
                    {transaction.quantity && (
                      <span className="text-sm text-muted-foreground">
                        {transaction.quantity.toLocaleString()} shares
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(transaction.total_amount)}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(transaction.transaction_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Holdings and Transactions */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="holdings" className="mt-6">
          <HoldingsList 
            portfolios={[portfolio]} 
            selectedPortfolioId={portfolio.id} 
          />
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <TransactionsList 
            portfolios={[portfolio]} 
            selectedPortfolioId={portfolio.id} 
          />
        </TabsContent>
      </Tabs>

      {/* Create Transaction Modal */}
      <CreateTransactionModal
        open={showCreateTransactionModal}
        onOpenChange={setShowCreateTransactionModal}
        portfolios={[portfolio]}
        selectedPortfolioId={portfolio.id}
      />
    </div>
  )
}
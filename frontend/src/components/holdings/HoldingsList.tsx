import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, Eye, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { holdingApi } from '@/services/holdingApi'
import type { Portfolio } from '@/types/portfolio'
import type { SecurityType } from '@/types/holding'

interface HoldingsListProps {
  portfolios: Portfolio[]
  selectedPortfolioId?: number
}

const SECURITY_TYPE_COLORS: Record<SecurityType, string> = {
  stock: 'bg-blue-100 text-blue-800',
  bond: 'bg-green-100 text-green-800',
  etf: 'bg-purple-100 text-purple-800',
  mutual_fund: 'bg-orange-100 text-orange-800',
  cash: 'bg-gray-100 text-gray-800',
  crypto: 'bg-yellow-100 text-yellow-800',
  other: 'bg-red-100 text-red-800',
}

const SECURITY_TYPE_LABELS: Record<SecurityType, string> = {
  stock: 'Stock',
  bond: 'Bond',
  etf: 'ETF',
  mutual_fund: 'Mutual Fund',
  cash: 'Cash',
  crypto: 'Crypto',
  other: 'Other',
}

export function HoldingsList({ portfolios, selectedPortfolioId }: HoldingsListProps) {
  const [selectedPortfolio, setSelectedPortfolio] = useState<number | undefined>(selectedPortfolioId)

  const { data: holdingsData, isLoading, error } = useQuery({
    queryKey: ['holdings', selectedPortfolio],
    queryFn: () => holdingApi.getHoldings(selectedPortfolio),
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

  const getSecurityTypeStyle = (type: SecurityType) => {
    return SECURITY_TYPE_COLORS[type] || 'bg-gray-100 text-gray-800'
  }

  // Calculate portfolio allocation percentages
  const calculateAllocation = (holdingValue: number, totalValue: number) => {
    if (totalValue === 0) return 0
    return (holdingValue / totalValue) * 100
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-red-600">
            Failed to load holdings. Please try again.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Holdings</h2>
          <p className="text-muted-foreground">
            Monitor your investment positions and performance
          </p>
        </div>
      </div>

      {/* Portfolio Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium">Portfolio:</label>
            <Select
              value={selectedPortfolio?.toString() || ''}
              onValueChange={(value) => setSelectedPortfolio(value ? parseInt(value) : undefined)}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="All portfolios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All portfolios</SelectItem>
                {portfolios.map((portfolio) => (
                  <SelectItem key={portfolio.id} value={portfolio.id.toString()}>
                    {portfolio.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {holdingsData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(holdingsData.total_value)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Cost Basis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(holdingsData.total_cost_basis)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Unrealized Gain/Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold flex items-center ${
                holdingsData.total_unrealized_gain_loss >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {holdingsData.total_unrealized_gain_loss >= 0 ? (
                  <TrendingUp className="h-5 w-5 mr-1" />
                ) : (
                  <TrendingDown className="h-5 w-5 mr-1" />
                )}
                {formatCurrency(holdingsData.total_unrealized_gain_loss)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Holdings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {holdingsData.total_count}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Holdings Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center">Loading holdings...</div>
          ) : holdingsData?.holdings.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No holdings found. Add transactions to see your holdings here.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Security</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Current Value</TableHead>
                  <TableHead className="text-right">Unrealized P&L</TableHead>
                  <TableHead className="text-right">Return %</TableHead>
                  <TableHead className="text-right">Allocation</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holdingsData?.holdings.map((holding) => {
                  const allocation = calculateAllocation(holding.current_value, holdingsData.total_value)
                  
                  return (
                    <TableRow key={holding.id}>
                      <TableCell className="font-medium">
                        {holding.symbol}
                      </TableCell>
                      <TableCell className="max-w-48 truncate">
                        {holding.security_name || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getSecurityTypeStyle(holding.security_type)}>
                          {SECURITY_TYPE_LABELS[holding.security_type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {holding.quantity.toLocaleString(undefined, { 
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 6 
                        })}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(holding.current_value)}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        holding.unrealized_gain_loss >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <div className="flex items-center justify-end">
                          {holding.unrealized_gain_loss >= 0 ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {formatCurrency(holding.unrealized_gain_loss)}
                        </div>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        holding.unrealized_gain_loss_percent >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatPercent(holding.unrealized_gain_loss_percent)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {allocation.toFixed(1)}%
                          </div>
                          <Progress value={allocation} className="h-1" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // TODO: Implement view holding details
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // TODO: Implement edit holding
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // TODO: Implement delete holding
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
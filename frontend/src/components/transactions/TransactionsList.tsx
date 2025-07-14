import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Plus, Filter, Eye, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { transactionApi } from '@/services/transactionApi'
import { CreateTransactionModal } from './CreateTransactionModal'
import type { TransactionType, TransactionFilters } from '@/types/transaction'
import type { Portfolio } from '@/types/portfolio'

interface TransactionsListProps {
  portfolios: Portfolio[]
  selectedPortfolioId?: number
}

const TRANSACTION_TYPE_COLORS: Record<TransactionType, string> = {
  buy: 'bg-green-100 text-green-800',
  sell: 'bg-red-100 text-red-800',
  dividend: 'bg-blue-100 text-blue-800',
  distribution: 'bg-purple-100 text-purple-800',
  transfer_in: 'bg-orange-100 text-orange-800',
  transfer_out: 'bg-gray-100 text-gray-800',
  split: 'bg-yellow-100 text-yellow-800',
  merger: 'bg-indigo-100 text-indigo-800',
  spinoff: 'bg-pink-100 text-pink-800',
}

const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  buy: 'Buy',
  sell: 'Sell',
  dividend: 'Dividend',
  distribution: 'Distribution',
  transfer_in: 'Transfer In',
  transfer_out: 'Transfer Out',
  split: 'Stock Split',
  merger: 'Merger',
  spinoff: 'Spinoff',
}

export function TransactionsList({ portfolios, selectedPortfolioId }: TransactionsListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filters, setFilters] = useState<TransactionFilters>({
    portfolio_id: selectedPortfolioId,
    limit: 25,
    skip: 0,
  })

  const { data: transactionsData, isLoading, error } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionApi.getTransactions(filters),
  })

  const updateFilter = (key: keyof TransactionFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value,
      skip: 0, // Reset pagination when filtering
    }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getTransactionTypeStyle = (type: TransactionType) => {
    return TRANSACTION_TYPE_COLORS[type] || 'bg-gray-100 text-gray-800'
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-red-600">
            Failed to load transactions. Please try again.
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
          <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground">
            Track and manage your investment transactions
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Portfolio Filter */}
            <div className="space-y-2">
              <Label>Portfolio</Label>
              <Select
                value={filters.portfolio_id?.toString() || ''}
                onValueChange={(value) => updateFilter('portfolio_id', value ? parseInt(value) : undefined)}
              >
                <SelectTrigger>
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

            {/* Transaction Type Filter */}
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={filters.transaction_type || ''}
                onValueChange={(value) => updateFilter('transaction_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  {Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Symbol Filter */}
            <div className="space-y-2">
              <Label>Symbol</Label>
              <Input
                placeholder="Search symbol..."
                value={filters.symbol || ''}
                onChange={(e) => updateFilter('symbol', e.target.value)}
              />
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={filters.start_date || ''}
                onChange={(e) => updateFilter('start_date', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center">Loading transactions...</div>
          ) : transactionsData?.transactions.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No transactions found. Add your first transaction to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Security</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Fees</TableHead>
                  <TableHead>Portfolio</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionsData?.transactions.map((transaction) => {
                  const portfolio = portfolios.find(p => p.id === transaction.portfolio_id)
                  
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge className={getTransactionTypeStyle(transaction.type)}>
                          {TRANSACTION_TYPE_LABELS[transaction.type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.symbol}
                      </TableCell>
                      <TableCell className="max-w-32 truncate">
                        {transaction.security_name || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {transaction.quantity 
                          ? transaction.quantity.toLocaleString(undefined, { 
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 6 
                            })
                          : '—'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        {transaction.price ? formatCurrency(transaction.price) : '—'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(transaction.total_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {transaction.fees > 0 ? formatCurrency(transaction.fees) : '—'}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {portfolio?.name || `Portfolio ${transaction.portfolio_id}`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // TODO: Implement view transaction details
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // TODO: Implement edit transaction
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // TODO: Implement delete transaction
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

      {/* Pagination */}
      {transactionsData && transactionsData.total_count > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Showing {(filters.skip || 0) + 1} to{' '}
            {Math.min((filters.skip || 0) + (filters.limit || 25), transactionsData.total_count)} of{' '}
            {transactionsData.total_count} transactions
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!transactionsData.has_previous}
              onClick={() => {
                setFilters(prev => ({
                  ...prev,
                  skip: Math.max(0, (prev.skip || 0) - (prev.limit || 25))
                }))
              }}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!transactionsData.has_next}
              onClick={() => {
                setFilters(prev => ({
                  ...prev,
                  skip: (prev.skip || 0) + (prev.limit || 25)
                }))
              }}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create Transaction Modal */}
      <CreateTransactionModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        portfolios={portfolios}
        selectedPortfolioId={selectedPortfolioId}
      />
    </div>
  )
}
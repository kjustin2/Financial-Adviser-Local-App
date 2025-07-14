import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { transactionApi } from '@/services/transactionApi'
import type { TransactionCreate, TransactionType } from '@/types/transaction'
import type { Portfolio } from '@/types/portfolio'

const transactionSchema = z.object({
  portfolio_id: z.number(),
  type: z.enum(['buy', 'sell', 'dividend', 'distribution', 'transfer_in', 'transfer_out']),
  symbol: z.string().min(1, 'Symbol is required').max(20),
  security_name: z.string().optional(),
  quantity: z.number().positive().optional(),
  price: z.number().positive().optional(),
  total_amount: z.number().min(0.01, 'Total amount must be positive'),
  fees: z.number().min(0).default(0),
  transaction_date: z.string().min(1, 'Transaction date is required'),
  notes: z.string().optional(),
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface CreateTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  portfolios: Portfolio[]
  selectedPortfolioId?: number
}

const TRANSACTION_TYPES: { value: TransactionType; label: string; requiresQuantity: boolean }[] = [
  { value: 'buy', label: 'Buy', requiresQuantity: true },
  { value: 'sell', label: 'Sell', requiresQuantity: true },
  { value: 'dividend', label: 'Dividend', requiresQuantity: false },
  { value: 'distribution', label: 'Distribution', requiresQuantity: false },
  { value: 'transfer_in', label: 'Transfer In', requiresQuantity: true },
  { value: 'transfer_out', label: 'Transfer Out', requiresQuantity: true },
]

export function CreateTransactionModal({ 
  open, 
  onOpenChange, 
  portfolios, 
  selectedPortfolioId 
}: CreateTransactionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      portfolio_id: selectedPortfolioId || portfolios[0]?.id,
      fees: 0,
      transaction_date: new Date().toISOString().split('T')[0],
    },
  })

  const watchedType = watch('type')
  const watchedQuantity = watch('quantity')
  const watchedPrice = watch('price')

  // Auto-calculate total amount for buy/sell transactions
  const calculateTotalAmount = () => {
    if (watchedType && ['buy', 'sell'].includes(watchedType) && watchedQuantity && watchedPrice) {
      const total = watchedQuantity * watchedPrice
      setValue('total_amount', Number(total.toFixed(2)))
    }
  }

  const createTransactionMutation = useMutation({
    mutationFn: transactionApi.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['holdings'] })
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
      onOpenChange(false)
      reset()
    },
  })

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true)
    try {
      const transactionData: TransactionCreate = {
        ...data,
        security_name: data.security_name || undefined,
        quantity: data.quantity || undefined,
        notes: data.notes || undefined,
      }

      await createTransactionMutation.mutateAsync(transactionData)
    } catch (error) {
      console.error('Failed to create transaction:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedTransactionType = TRANSACTION_TYPES.find(t => t.value === watchedType)
  const requiresQuantity = selectedTransactionType?.requiresQuantity ?? false
  const requiresPrice = watchedType && ['buy', 'sell'].includes(watchedType)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Record a new transaction to automatically update your portfolio holdings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Portfolio Selection */}
            <div className="space-y-2">
              <Label htmlFor="portfolio">Portfolio</Label>
              <Select 
                value={watch('portfolio_id')?.toString()} 
                onValueChange={(value) => setValue('portfolio_id', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select portfolio" />
                </SelectTrigger>
                <SelectContent>
                  {portfolios.map((portfolio) => (
                    <SelectItem key={portfolio.id} value={portfolio.id.toString()}>
                      {portfolio.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.portfolio_id && (
                <p className="text-sm text-red-600">{errors.portfolio_id.message}</p>
              )}
            </div>

            {/* Transaction Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type</Label>
              <Select 
                value={watchedType} 
                onValueChange={(value) => setValue('type', value as TransactionType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Symbol */}
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Input
                id="symbol"
                {...register('symbol')}
                placeholder="AAPL"
                className="uppercase"
                onChange={(e) => {
                  e.target.value = e.target.value.toUpperCase()
                  register('symbol').onChange(e)
                }}
              />
              {errors.symbol && (
                <p className="text-sm text-red-600">{errors.symbol.message}</p>
              )}
            </div>

            {/* Security Name */}
            <div className="space-y-2">
              <Label htmlFor="security_name">Security Name (Optional)</Label>
              <Input
                id="security_name"
                {...register('security_name')}
                placeholder="Apple Inc."
              />
            </div>
          </div>

          {requiresQuantity && (
            <div className="grid grid-cols-2 gap-4">
              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.000001"
                  {...register('quantity', { valueAsNumber: true })}
                  onBlur={calculateTotalAmount}
                />
                {errors.quantity && (
                  <p className="text-sm text-red-600">{errors.quantity.message}</p>
                )}
              </div>

              {/* Price */}
              {requiresPrice && (
                <div className="space-y-2">
                  <Label htmlFor="price">Price per Share</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.0001"
                    {...register('price', { valueAsNumber: true })}
                    onBlur={calculateTotalAmount}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Total Amount */}
            <div className="space-y-2">
              <Label htmlFor="total_amount">Total Amount ($)</Label>
              <Input
                id="total_amount"
                type="number"
                step="0.01"
                {...register('total_amount', { valueAsNumber: true })}
              />
              {errors.total_amount && (
                <p className="text-sm text-red-600">{errors.total_amount.message}</p>
              )}
            </div>

            {/* Fees */}
            <div className="space-y-2">
              <Label htmlFor="fees">Fees ($)</Label>
              <Input
                id="fees"
                type="number"
                step="0.01"
                {...register('fees', { valueAsNumber: true })}
              />
              {errors.fees && (
                <p className="text-sm text-red-600">{errors.fees.message}</p>
              )}
            </div>
          </div>

          {/* Transaction Date */}
          <div className="space-y-2">
            <Label htmlFor="transaction_date">Transaction Date</Label>
            <Input
              id="transaction_date"
              type="date"
              {...register('transaction_date')}
            />
            {errors.transaction_date && (
              <p className="text-sm text-red-600">{errors.transaction_date.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Additional notes about this transaction..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
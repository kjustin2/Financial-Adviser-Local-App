import { format } from 'date-fns'

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const formatPercentage = (value: number, decimals = 2): string => {
  return `${value.toFixed(decimals)}%`
}

export const formatNumber = (value: number, decimals = 0): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export const formatCompactNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value)
}

export const formatDate = (date: Date | string, dateFormat = 'MM/dd/yyyy'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, dateFormat)
}

export const formatRelativeDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInDays = Math.ceil((dateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Tomorrow'
  if (diffInDays === -1) return 'Yesterday'
  if (diffInDays > 0) return `In ${diffInDays} days`
  return `${Math.abs(diffInDays)} days ago`
}

export const formatSecurityType = (type: string): string => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export const formatGainLoss = (value: number): { text: string; isPositive: boolean } => {
  const isPositive = value >= 0
  const text = isPositive ? `+${formatCurrency(value)}` : formatCurrency(value)
  return { text, isPositive }
}

export const formatGainLossPercentage = (value: number): { text: string; isPositive: boolean } => {
  const isPositive = value >= 0
  const text = isPositive ? `+${formatPercentage(value)}` : formatPercentage(value)
  return { text, isPositive }
}
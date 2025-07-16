import React from 'react'
import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={clsx('bg-white rounded-lg border border-gray-200 shadow-sm', className)}>
      {children}
    </div>
  )
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return (
    <div className={clsx('px-6 py-4 border-b border-gray-200', className)}>
      {children}
    </div>
  )
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return (
    <div className={clsx('px-6 py-4', className)}>
      {children}
    </div>
  )
}

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  return (
    <h3 className={clsx('text-lg font-semibold text-gray-900', className)}>
      {children}
    </h3>
  )
}
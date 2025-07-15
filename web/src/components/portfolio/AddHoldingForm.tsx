import React, { useState } from 'react'
import { Button, Input, Select, Modal, ModalFooter } from '../common'
import { SecurityType } from '../../types'
import type { CreateHoldingData, UpdateHoldingData, Holding } from '../../types'

interface AddHoldingFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateHoldingData | UpdateHoldingData) => Promise<void>
  editingHolding?: Holding
  isLoading?: boolean
}

export const AddHoldingForm: React.FC<AddHoldingFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingHolding,
  isLoading = false
}) => {
  const isEditing = !!editingHolding

  const [formData, setFormData] = useState<CreateHoldingData>({
    symbol: editingHolding?.symbol || '',
    securityName: editingHolding?.securityName || '',
    securityType: editingHolding?.securityType || SecurityType.STOCK,
    quantity: editingHolding?.quantity || 0,
    purchasePrice: editingHolding?.purchasePrice || 0,
    purchaseDate: editingHolding?.purchaseDate 
      ? new Date(editingHolding.purchaseDate).toISOString().split('T')[0] as any
      : new Date().toISOString().split('T')[0] as any,
    currentPrice: editingHolding?.currentPrice
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const securityTypes = [
    { value: SecurityType.STOCK, label: 'Stock' },
    { value: SecurityType.ETF, label: 'ETF' },
    { value: SecurityType.MUTUAL_FUND, label: 'Mutual Fund' },
    { value: SecurityType.BOND, label: 'Bond' },
    { value: SecurityType.CASH, label: 'Cash' },
    { value: SecurityType.CRYPTO, label: 'Cryptocurrency' },
    { value: SecurityType.OTHER, label: 'Other' }
  ]

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Symbol is required'
    } else if (formData.symbol.length > 20) {
      newErrors.symbol = 'Symbol must be 20 characters or less'
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0'
    }

    if (formData.purchasePrice <= 0) {
      newErrors.purchasePrice = 'Purchase price must be greater than 0'
    }

    if (formData.currentPrice !== undefined && formData.currentPrice <= 0) {
      newErrors.currentPrice = 'Current price must be greater than 0'
    }

    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Purchase date is required'
    } else {
      const purchaseDate = new Date(formData.purchaseDate)
      const today = new Date()
      if (purchaseDate > today) {
        newErrors.purchaseDate = 'Purchase date cannot be in the future'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      const submitData = {
        ...formData,
        symbol: formData.symbol.toUpperCase(),
        purchaseDate: new Date(formData.purchaseDate)
      }

      if (isEditing) {
        await onSubmit({ id: editingHolding.id, ...submitData })
      } else {
        await onSubmit(submitData)
      }
      
      handleClose()
    } catch (error) {
      console.error('Failed to save holding:', error)
    }
  }

  const handleClose = () => {
    setFormData({
      symbol: '',
      securityName: '',
      securityType: SecurityType.STOCK,
      quantity: 0,
      purchasePrice: 0,
      purchaseDate: new Date().toISOString().split('T')[0] as any,
      currentPrice: undefined
    })
    setErrors({})
    onClose()
  }

  const handleInputChange = (field: keyof CreateHoldingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Holding' : 'Add New Holding'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Symbol *"
            value={formData.symbol}
            onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
            error={errors.symbol}
            placeholder="AAPL, MSFT, etc."
            required
          />

          <Select
            label="Security Type *"
            value={formData.securityType}
            onChange={(value) => handleInputChange('securityType', value as SecurityType)}
            options={securityTypes}
            required
          />
        </div>

        <Input
          label="Security Name (Optional)"
          value={formData.securityName || ''}
          onChange={(e) => handleInputChange('securityName', e.target.value)}
          placeholder="Apple Inc., Microsoft Corporation, etc."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Quantity *"
            type="number"
            step="0.000001"
            min="0"
            value={formData.quantity}
            onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)}
            error={errors.quantity}
            required
          />

          <Input
            label="Purchase Price *"
            type="number"
            step="0.01"
            min="0"
            value={formData.purchasePrice}
            onChange={(e) => handleInputChange('purchasePrice', parseFloat(e.target.value) || 0)}
            error={errors.purchasePrice}
            placeholder="0.00"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Purchase Date *"
            type="date"
            value={formData.purchaseDate instanceof Date ? formData.purchaseDate.toISOString().split('T')[0] : formData.purchaseDate}
            onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
            error={errors.purchaseDate}
            required
          />

          <Input
            label="Current Price (Optional)"
            type="number"
            step="0.01"
            min="0"
            value={formData.currentPrice || ''}
            onChange={(e) => handleInputChange('currentPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
            error={errors.currentPrice}
            placeholder="0.00"
            helperText="Leave empty to use purchase price"
          />
        </div>

        {/* Calculated Values */}
        {formData.quantity > 0 && formData.purchasePrice > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Calculated Values</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Cost Basis:</span>
                <div className="font-medium">
                  ${(formData.quantity * formData.purchasePrice).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Current Value:</span>
                <div className="font-medium">
                  ${(formData.quantity * (formData.currentPrice || formData.purchasePrice)).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        <ModalFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditing ? 'Update Holding' : 'Add Holding'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
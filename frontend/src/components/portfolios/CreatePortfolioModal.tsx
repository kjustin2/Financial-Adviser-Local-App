import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { apiService } from '@/services/api'
import { useQueryClient } from '@tanstack/react-query'

// Account type configurations for MVP
const ACCOUNT_TYPES = {
  '401k': {
    name: '401(k)',
    description: 'Employer-sponsored retirement account',
    risk_level: 'moderate',
    tax_advantaged: true,
    rebalance_frequency: 'quarterly',
    rebalance_threshold: 5.0,
  },
  'traditional_ira': {
    name: 'Traditional IRA',
    description: 'Individual retirement account with tax-deferred growth',
    risk_level: 'moderate',
    tax_advantaged: true,
    rebalance_frequency: 'semiannually',
    rebalance_threshold: 5.0,
  },
  'roth_ira': {
    name: 'Roth IRA',
    description: 'After-tax retirement account with tax-free withdrawals',
    risk_level: 'moderate',
    tax_advantaged: true,
    rebalance_frequency: 'semiannually',
    rebalance_threshold: 5.0,
  },
  'brokerage': {
    name: 'Brokerage Account',
    description: 'Taxable investment account',
    risk_level: 'moderate',
    tax_advantaged: false,
    rebalance_frequency: 'quarterly',
    rebalance_threshold: 3.0,
  },
  'hsa': {
    name: 'HSA (Health Savings Account)',
    description: 'Triple tax-advantaged health savings account',
    risk_level: 'conservative',
    tax_advantaged: true,
    rebalance_frequency: 'annually',
    rebalance_threshold: 10.0,
  },
  '529_education': {
    name: '529 Education',
    description: 'Tax-advantaged education savings plan',
    risk_level: 'moderate',
    tax_advantaged: true,
    rebalance_frequency: 'annually',
    rebalance_threshold: 5.0,
  },
  'crypto': {
    name: 'Cryptocurrency Wallet',
    description: 'Digital asset portfolio',
    risk_level: 'aggressive',
    tax_advantaged: false,
    rebalance_frequency: 'never',
    rebalance_threshold: 20.0,
  },
  'real_estate': {
    name: 'Real Estate',
    description: 'Real estate investment portfolio',
    risk_level: 'moderate',
    tax_advantaged: false,
    rebalance_frequency: 'annually',
    rebalance_threshold: 15.0,
  },
  'other': {
    name: 'Other Investment',
    description: 'Other investment accounts',
    risk_level: 'moderate',
    tax_advantaged: false,
    rebalance_frequency: 'quarterly',
    rebalance_threshold: 5.0,
  },
} as const

interface CreatePortfolioModalProps {
  children?: React.ReactNode
}

export function CreatePortfolioModal({ children }: CreatePortfolioModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    account_type: 'brokerage' as keyof typeof ACCOUNT_TYPES,
    current_value: '',
  })

  const queryClient = useQueryClient()

  // Get account type configuration
  const selectedAccountConfig = ACCOUNT_TYPES[formData.account_type]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setIsLoading(true)
    try {
      // Build portfolio data with auto-determined characteristics
      const portfolioData = {
        name: formData.name,
        description: formData.description || selectedAccountConfig.description,
        portfolio_type: formData.account_type,
        risk_level: selectedAccountConfig.risk_level,
        rebalance_frequency: selectedAccountConfig.rebalance_frequency,
        rebalance_threshold: selectedAccountConfig.rebalance_threshold,
        tax_advantaged: selectedAccountConfig.tax_advantaged,
        current_value: formData.current_value ? parseFloat(formData.current_value) : 0,
      }

      await apiService.post('/api/v1/portfolios/', portfolioData)
      
      // Refresh portfolios data
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
      
      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        account_type: 'brokerage',
        current_value: '',
      })
      setOpen(false)
    } catch (error) {
      console.error('Failed to create portfolio:', error)
      // TODO: Add error toast notification
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Portfolio
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" data-testid="create-portfolio-modal">
        <DialogHeader>
          <DialogTitle>Create New Portfolio</DialogTitle>
          <DialogDescription>
            Add a new investment portfolio to track your holdings and performance.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Portfolio Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., My 401k, Emergency Fund, Crypto Portfolio"
              required
              data-testid="portfolio-name-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_type">Account Type *</Label>
            <Select
              value={formData.account_type}
              onValueChange={(value) => handleInputChange('account_type', value)}
            >
              <SelectTrigger data-testid="account-type-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ACCOUNT_TYPES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600">{selectedAccountConfig.description}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_value">Current Value (Optional)</Label>
            <Input
              id="current_value"
              name="current_value"
              type="number"
              min="0"
              step="0.01"
              value={formData.current_value}
              onChange={(e) => handleInputChange('current_value', e.target.value)}
              placeholder="0.00"
              data-testid="portfolio-value-input"
            />
            <p className="text-xs text-gray-500">Enter the current value if you're tracking an existing portfolio</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={`Brief description... (defaults to: ${selectedAccountConfig.description})`}
              rows={2}
              data-testid="portfolio-description-input"
            />
          </div>

          {/* Auto-configured settings summary */}
          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            <h4 className="font-medium text-gray-900 mb-2">Auto-configured settings for {selectedAccountConfig.name}:</h4>
            <ul className="space-y-1 text-gray-700">
              <li>• Risk Level: <span className="font-medium capitalize">{selectedAccountConfig.risk_level}</span></li>
              <li>• Tax Status: <span className="font-medium">{selectedAccountConfig.tax_advantaged ? 'Tax-advantaged' : 'Taxable'}</span></li>
              <li>• Rebalancing: <span className="font-medium capitalize">{selectedAccountConfig.rebalance_frequency}</span> 
                {selectedAccountConfig.rebalance_frequency !== 'never' && 
                  ` (${selectedAccountConfig.rebalance_threshold}% threshold)`
                }
              </li>
            </ul>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} data-testid="cancel-portfolio-btn">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name.trim()} data-testid="create-portfolio-submit-btn">
              {isLoading ? 'Creating...' : 'Create Portfolio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
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

interface CreatePortfolioModalProps {
  children?: React.ReactNode
}

export function CreatePortfolioModal({ children }: CreatePortfolioModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    portfolio_type: 'investment',
    risk_level: 'moderate',
    rebalance_frequency: 'quarterly',
    rebalance_threshold: '5.0',
    benchmark_symbol: '',
  })

  const queryClient = useQueryClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setIsLoading(true)
    try {
      await apiService.post('/api/v1/portfolios/', {
        ...formData,
        rebalance_threshold: parseFloat(formData.rebalance_threshold),
      })
      
      // Refresh portfolios data
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
      
      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        portfolio_type: 'investment',
        risk_level: 'moderate',
        rebalance_frequency: 'quarterly',
        rebalance_threshold: '5.0',
        benchmark_symbol: '',
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
      <DialogContent className="sm:max-w-[425px]">
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
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Growth Portfolio, Retirement 401k"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of this portfolio's purpose..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="portfolio_type">Portfolio Type</Label>
              <Select
                value={formData.portfolio_type}
                onValueChange={(value) => handleInputChange('portfolio_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="retirement">Retirement</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="emergency">Emergency Fund</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="risk_level">Risk Level</Label>
              <Select
                value={formData.risk_level}
                onValueChange={(value) => handleInputChange('risk_level', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rebalance_frequency">Rebalance Frequency</Label>
              <Select
                value={formData.rebalance_frequency}
                onValueChange={(value) => handleInputChange('rebalance_frequency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="semiannually">Semi-annually</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rebalance_threshold">Rebalance Threshold (%)</Label>
              <Input
                id="rebalance_threshold"
                type="number"
                min="1"
                max="20"
                step="0.5"
                value={formData.rebalance_threshold}
                onChange={(e) => handleInputChange('rebalance_threshold', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="benchmark_symbol">Benchmark Symbol (Optional)</Label>
            <Input
              id="benchmark_symbol"
              value={formData.benchmark_symbol}
              onChange={(e) => handleInputChange('benchmark_symbol', e.target.value)}
              placeholder="e.g., SPY, VTI"
              maxLength={10}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name.trim()}>
              {isLoading ? 'Creating...' : 'Create Portfolio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
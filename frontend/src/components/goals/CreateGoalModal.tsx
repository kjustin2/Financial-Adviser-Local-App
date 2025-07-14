import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogFooter,
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiService } from '@/services/api';
import { useQueryClient } from '@tanstack/react-query';

interface CreateGoalModalProps {
  children?: React.ReactNode;
}

interface GoalFormData {
  name: string;
  description: string;
  target_amount: string;
  target_date: string;
  category: string;
  priority: string;
}

export function CreateGoalModal({ children }: CreateGoalModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<GoalFormData>({
    name: '',
    description: '',
    target_amount: '',
    target_date: '',
    category: '',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  const handleInputChange = (field: keyof GoalFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Goal name is required');
      return;
    }
    
    if (!formData.target_amount || parseFloat(formData.target_amount) <= 0) {
      setError('Target amount must be greater than 0');
      return;
    }
    
    if (!formData.target_date) {
      setError('Target date is required');
      return;
    }
    
    if (!formData.category) {
      setError('Category is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await apiService.post('/api/v1/goals/', {
        name: formData.name.trim(),
        description: formData.description.trim(),
        target_amount: parseFloat(formData.target_amount),
        target_date: formData.target_date,
        category: formData.category,
        priority: formData.priority
      });

      // Refresh goals data
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      
      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        target_amount: '',
        target_date: '',
        category: '',
        priority: 'medium'
      });
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setFormData({
      name: '',
      description: '',
      target_amount: '',
      target_date: '',
      category: '',
      priority: 'medium'
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Goal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" data-testid="create-goal-modal">
        <DialogHeader>
          <DialogTitle>Create New Goal</DialogTitle>
          <DialogDescription>
            Set a financial goal and track your progress towards achieving it.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md" data-testid="error-message">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">Goal Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g. Retirement Fund, House Down Payment"
              data-testid="goal-name-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Optional description of your goal"
              rows={3}
              data-testid="goal-description-input"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target_amount">Target Amount *</Label>
              <Input
                id="target_amount"
                name="target_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.target_amount}
                onChange={(e) => handleInputChange('target_amount', e.target.value)}
                placeholder="100000"
                data-testid="goal-target-amount-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="target_date">Target Date *</Label>
              <Input
                id="target_date"
                name="target_date"
                type="date"
                value={formData.target_date}
                onChange={(e) => handleInputChange('target_date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                data-testid="goal-target-date-input"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger data-testid="goal-category-select">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retirement">Retirement</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="emergency">Emergency Fund</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger data-testid="goal-priority-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              data-testid="cancel-goal-btn"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              data-testid="create-goal-submit-btn"
            >
              {loading ? 'Creating...' : 'Create Goal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
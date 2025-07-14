import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Target, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Calculator,
  AlertCircle,
  CheckCircle,
  Clock,
  Lightbulb,
  BarChart3,
  Shield
} from 'lucide-react';
import { CreateGoalModal } from '@/components/goals/CreateGoalModal';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';

interface Goal {
  id: number;
  name: string;
  description: string;
  target_amount: number;
  target_date: string;
  current_amount: number;
  progress_percentage: number;
  category: string;
  priority: string;
  is_active: boolean;
  // Enhanced MVP properties
  monthly_contribution?: number;
  success_probability?: number;
  recommended_monthly_amount?: number;
  months_to_goal?: number;
  funding_strategy?: string;
  created_at: string;
  updated_at: string;
}

interface GoalAnalytics {
  total_target_amount: number;
  total_current_amount: number;
  average_progress: number;
  goals_on_track: number;
  goals_behind: number;
  recommended_monthly_savings: number;
}

// Enhanced goal calculation functions for MVP
const calculateMonthsToGoal = (targetDate: string): number => {
  const target = new Date(targetDate);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
  return Math.max(0, diffMonths);
};

const calculateRequiredMonthlyContribution = (
  targetAmount: number, 
  currentAmount: number, 
  monthsRemaining: number,
  expectedReturn: number = 0.07 // 7% annual return assumption
): number => {
  if (monthsRemaining <= 0) return 0;
  
  const monthlyReturn = expectedReturn / 12;
  const futureValueOfCurrent = currentAmount * Math.pow(1 + monthlyReturn, monthsRemaining);
  const remainingAmount = targetAmount - futureValueOfCurrent;
  
  if (remainingAmount <= 0) return 0;
  
  // PMT calculation for annuity
  const monthlyContribution = remainingAmount / 
    (((Math.pow(1 + monthlyReturn, monthsRemaining) - 1) / monthlyReturn));
  
  return Math.max(0, monthlyContribution);
};

const calculateSuccessProbability = (
  currentAmount: number,
  targetAmount: number,
  monthlyContribution: number,
  monthsRemaining: number,
  expectedReturn: number = 0.07,
  volatility: number = 0.15
): number => {
  // Simplified Monte Carlo simulation
  const annualReturn = expectedReturn;
  const monthlyReturn = annualReturn / 12;
  const monthlyVolatility = volatility / Math.sqrt(12);
  
  let successCount = 0;
  const simulations = 1000;
  
  for (let i = 0; i < simulations; i++) {
    let amount = currentAmount;
    
    for (let month = 0; month < monthsRemaining; month++) {
      // Add monthly contribution
      amount += monthlyContribution;
      
      // Apply random return
      const randomReturn = monthlyReturn + (Math.random() - 0.5) * 2 * monthlyVolatility;
      amount *= (1 + randomReturn);
    }
    
    if (amount >= targetAmount) {
      successCount++;
    }
  }
  
  return (successCount / simulations) * 100;
};

const getFundingStrategy = (goal: Goal): string => {
  const monthsRemaining = calculateMonthsToGoal(goal.target_date);
  const progress = goal.progress_percentage;
  
  if (progress >= 75) {
    return "Stay on track with current strategy";
  } else if (monthsRemaining <= 12) {
    return "Consider high-yield savings for stability";
  } else if (monthsRemaining <= 60) {
    return "Balanced portfolio with moderate risk";
  } else {
    return "Growth-focused portfolio for long-term gains";
  }
};

export function GoalsList() {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Fetch goals with React Query
  const { data: goalsResponse, isLoading, error } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const response = await apiService.get('/api/v1/goals/');
      return response;
    },
  });

  const goals: Goal[] = goalsResponse?.goals || [];
  const analytics: GoalAnalytics = {
    total_target_amount: goalsResponse?.total_target_amount || 0,
    total_current_amount: goalsResponse?.total_current_amount || 0,
    average_progress: goalsResponse?.average_progress || 0,
    goals_on_track: goalsResponse?.goals_on_track || 0,
    goals_behind: goalsResponse?.goals_behind || 0,
    recommended_monthly_savings: 0
  };

  // Process goals with enhanced calculations
  const enhancedGoals = goals.map(goal => {
    const monthsToGoal = calculateMonthsToGoal(goal.target_date);
    const recommendedMonthlyAmount = calculateRequiredMonthlyContribution(
      goal.target_amount, 
      goal.current_amount, 
      monthsToGoal
    );
    const currentMonthlyContribution = goal.monthly_contribution || recommendedMonthlyAmount;
    const successProbability = calculateSuccessProbability(
      goal.current_amount,
      goal.target_amount,
      currentMonthlyContribution,
      monthsToGoal
    );
    const fundingStrategy = getFundingStrategy(goal);

    return {
      ...goal,
      months_to_goal: monthsToGoal,
      recommended_monthly_amount: recommendedMonthlyAmount,
      success_probability: successProbability,
      funding_strategy: fundingStrategy
    };
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'retirement': return <Target className="h-5 w-5" />;
      case 'education': return <Calendar className="h-5 w-5" />;
      case 'house': return <DollarSign className="h-5 w-5" />;
      case 'emergency': return <Shield className="h-5 w-5" />;
      case 'vacation': return <Calendar className="h-5 w-5" />;
      default: return <TrendingUp className="h-5 w-5" />;
    }
  };

  const getSuccessProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600';
    if (probability >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="loading-state">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6" data-testid="error-state">
        <Card className="border-red-200">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to load goals</h3>
            <p className="text-red-600 mb-4">{error?.message || 'Something went wrong'}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Goals</h1>
          <p className="text-gray-600 mt-1">
            Plan, track, and achieve your financial objectives with smart recommendations
          </p>
        </div>
        <CreateGoalModal>
          <Button className="mt-4 lg:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Create Goal
          </Button>
        </CreateGoalModal>
      </div>

      {/* Analytics Dashboard */}
      {enhancedGoals.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Target</p>
                  <p className="text-2xl font-bold">{formatCurrency(analytics.total_target_amount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Current Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(analytics.total_current_amount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">On Track</p>
                  <p className="text-2xl font-bold">{analytics.goals_on_track}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                  <p className="text-2xl font-bold">{analytics.average_progress.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Goals List */}
      {enhancedGoals.length === 0 ? (
        <Card data-testid="empty-goals-state">
          <CardContent className="p-12 text-center">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Goals Yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first financial goal to start planning your future
            </p>
            <CreateGoalModal>
              <Button size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Goal
              </Button>
            </CreateGoalModal>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-testid="goals-list">
          {enhancedGoals.map((goal) => (
            <Card 
              key={goal.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer" 
              data-testid="goal-card"
              onClick={() => setSelectedGoal(goal)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      {getCategoryIcon(goal.category)}
                    </div>
                    <div>
                      <CardTitle className="text-lg leading-tight">{goal.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getPriorityColor(goal.priority)}>
                          {goal.priority}
                        </Badge>
                        <span className="text-xs text-gray-500 capitalize">
                          {goal.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span className="font-medium">{goal.progress_percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={goal.progress_percentage} className="h-2" />
                  </div>
                  
                  {/* Amounts */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Current</p>
                      <p className="font-semibold">{formatCurrency(goal.current_amount)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Target</p>
                      <p className="font-semibold">{formatCurrency(goal.target_amount)}</p>
                    </div>
                  </div>
                  
                  {/* Enhanced MVP Features */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly needed:</span>
                      <span className="font-medium text-blue-600">
                        {formatCurrency(goal.recommended_monthly_amount || 0)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Success probability:</span>
                      <span className={`font-medium ${getSuccessProbabilityColor(goal.success_probability || 0)}`}>
                        {(goal.success_probability || 0).toFixed(0)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time remaining:</span>
                      <span className="font-medium">
                        {goal.months_to_goal || 0} months
                      </span>
                    </div>
                  </div>
                  
                  {/* Strategy Insight */}
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-blue-800">Strategy</p>
                        <p className="text-xs text-blue-700">{goal.funding_strategy}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Target Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Target: {formatDate(goal.target_date)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Goal Detail Modal - TODO: Implement detailed view */}
      {selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  {getCategoryIcon(selectedGoal.category)}
                  {selectedGoal.name}
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedGoal(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">This detailed view will include:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Advanced Monte Carlo projections</li>
                    <li>• Goal contribution tracking</li>
                    <li>• What-if scenario modeling</li>
                    <li>• Tax-efficient funding strategies</li>
                    <li>• Goal interdependency analysis</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
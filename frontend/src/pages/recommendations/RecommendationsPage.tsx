import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Lightbulb,
  TrendingUp,
  Shield,
  DollarSign,
  Target,
  PieChart,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  BarChart3,
  Banknote,
  Calculator,
  Filter,
  SortAsc
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';

interface Recommendation {
  id: string;
  type: 'portfolio_optimization' | 'tax_efficiency' | 'goal_achievement' | 'risk_management' | 'cost_reduction';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  action_items: string[];
  expected_outcome: string;
  implementation_difficulty: 'easy' | 'moderate' | 'complex';
  time_to_implement: string;
  potential_savings?: number;
  confidence_score: number;
  created_at: string;
}

interface RecommendationCategory {
  type: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const RECOMMENDATION_CATEGORIES: RecommendationCategory[] = [
  {
    type: 'portfolio_optimization',
    name: 'Portfolio Optimization',
    description: 'Improve asset allocation and risk-adjusted returns',
    icon: <PieChart className="h-5 w-5" />,
    color: 'bg-blue-500'
  },
  {
    type: 'tax_efficiency',
    name: 'Tax Efficiency',
    description: 'Reduce tax burden and optimize after-tax returns',
    icon: <Calculator className="h-5 w-5" />,
    color: 'bg-green-500'
  },
  {
    type: 'goal_achievement',
    name: 'Goal Achievement',
    description: 'Accelerate progress toward financial objectives',
    icon: <Target className="h-5 w-5" />,
    color: 'bg-purple-500'
  },
  {
    type: 'risk_management',
    name: 'Risk Management',
    description: 'Protect wealth and manage downside risk',
    icon: <Shield className="h-5 w-5" />,
    color: 'bg-orange-500'
  },
  {
    type: 'cost_reduction',
    name: 'Cost Reduction',
    description: 'Lower fees and investment expenses',
    icon: <Banknote className="h-5 w-5" />,
    color: 'bg-red-500'
  }
];

// Mock data for MVP demonstration - in real app this would come from AI engine
const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: '1',
    type: 'portfolio_optimization',
    priority: 'high',
    title: 'Rebalance Portfolio Allocation',
    description: 'Your portfolio has drifted significantly from target allocation, with tech stocks now 45% vs. target 30%.',
    impact: 'Reduce portfolio volatility by 12% while maintaining expected returns',
    action_items: [
      'Sell $5,000 of technology sector ETF (VGT)',
      'Buy $3,000 of international developed markets (VXUS)',
      'Buy $2,000 of bonds (BND)'
    ],
    expected_outcome: 'Better diversification and risk-adjusted returns',
    implementation_difficulty: 'easy',
    time_to_implement: '1 hour',
    confidence_score: 95,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    type: 'tax_efficiency',
    priority: 'high',
    title: 'Tax-Loss Harvesting Opportunity',
    description: 'Your underperforming growth stocks can be sold to offset capital gains, saving on taxes.',
    impact: 'Save approximately $1,250 in taxes this year',
    action_items: [
      'Sell 100 shares of Growth Stock ABC (15% loss)',
      'Buy similar ETF to maintain market exposure',
      'Use losses to offset gains from your REIT sales'
    ],
    expected_outcome: 'Immediate tax savings while maintaining portfolio exposure',
    implementation_difficulty: 'moderate',
    time_to_implement: '2 hours',
    potential_savings: 1250,
    confidence_score: 88,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    type: 'goal_achievement',
    priority: 'medium',
    title: 'Accelerate Emergency Fund Goal',
    description: 'Your emergency fund is only 60% complete. Increasing contributions will provide better financial security.',
    impact: 'Complete emergency fund 8 months earlier than current trajectory',
    action_items: [
      'Increase automatic transfer to high-yield savings by $200/month',
      'Redirect bonus money to emergency fund',
      'Consider side income to boost savings rate'
    ],
    expected_outcome: 'Full 6-month emergency fund by Q3 2025',
    implementation_difficulty: 'easy',
    time_to_implement: '30 minutes',
    confidence_score: 92,
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    type: 'risk_management',
    priority: 'medium',
    title: 'Improve Portfolio Diversification',
    description: 'Your portfolio lacks exposure to real estate and commodities, creating concentration risk.',
    impact: 'Reduce overall portfolio risk by 8% through better diversification',
    action_items: [
      'Add 5% allocation to REITs (VNQ)',
      'Add 3% allocation to commodities (PDBC)',
      'Reduce domestic equity allocation accordingly'
    ],
    expected_outcome: 'More resilient portfolio across market cycles',
    implementation_difficulty: 'moderate',
    time_to_implement: '1.5 hours',
    confidence_score: 85,
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    type: 'cost_reduction',
    priority: 'low',
    title: 'Switch to Lower-Cost Index Funds',
    description: 'Your actively managed funds have high expense ratios. Index alternatives offer similar returns with lower costs.',
    impact: 'Save $380 annually in management fees',
    action_items: [
      'Replace Large Cap Growth Fund (0.85% ER) with VGT (0.10% ER)',
      'Switch Bond Fund (0.65% ER) to BND (0.03% ER)',
      'Keep tax implications in mind when switching'
    ],
    expected_outcome: 'Lower costs boost long-term returns by ~0.5% annually',
    implementation_difficulty: 'moderate',
    time_to_implement: '2 hours',
    potential_savings: 380,
    confidence_score: 90,
    created_at: new Date().toISOString()
  }
];

export function RecommendationsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);

  // In real app, this would fetch from AI recommendation engine
  const { data: recommendations = MOCK_RECOMMENDATIONS, isLoading, error } = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => {
      // For MVP, return mock data
      return MOCK_RECOMMENDATIONS;
    },
  });

  const filteredRecommendations = recommendations.filter(rec => {
    if (selectedCategory && rec.type !== selectedCategory) return false;
    if (selectedPriority && rec.priority !== selectedPriority) return false;
    return true;
  });

  const priorityStats = {
    high: recommendations.filter(r => r.priority === 'high').length,
    medium: recommendations.filter(r => r.priority === 'medium').length,
    low: recommendations.filter(r => r.priority === 'low').length
  };

  const totalPotentialSavings = recommendations
    .filter(r => r.potential_savings)
    .reduce((sum, r) => sum + (r.potential_savings || 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'complex': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryInfo = (type: string) => {
    return RECOMMENDATION_CATEGORIES.find(cat => cat.type === type);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to load recommendations</h3>
            <p className="text-red-600 mb-4">Please try refreshing the page</p>
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI-Powered Recommendations</h1>
        <p className="text-gray-600 mt-1">
          Personalized insights to optimize your investment strategy and achieve your financial goals
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Lightbulb className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Recommendations</p>
                <p className="text-2xl font-bold">{recommendations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold">{priorityStats.high}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Potential Savings</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPotentialSavings)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                <p className="text-2xl font-bold">
                  {Math.round(recommendations.reduce((sum, r) => sum + r.confidence_score, 0) / recommendations.length)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Recommendation Categories
          </CardTitle>
          <CardDescription>
            Filter recommendations by category to focus on specific areas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className="justify-start"
            >
              All Categories ({recommendations.length})
            </Button>
            {RECOMMENDATION_CATEGORIES.map((category) => {
              const count = recommendations.filter(r => r.type === category.type).length;
              return (
                <Button
                  key={category.type}
                  variant={selectedCategory === category.type ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.type)}
                  className="justify-start"
                >
                  <div className={`w-3 h-3 rounded-full ${category.color} mr-2`} />
                  {category.name} ({count})
                </Button>
              );
            })}
          </div>
          
          {/* Priority Filter */}
          <div className="flex gap-2 mt-4">
            <span className="text-sm font-medium">Priority:</span>
            <Button
              size="sm"
              variant={selectedPriority === null ? "default" : "outline"}
              onClick={() => setSelectedPriority(null)}
            >
              All
            </Button>
            {['high', 'medium', 'low'].map((priority) => (
              <Button
                key={priority}
                size="sm"
                variant={selectedPriority === priority ? "default" : "outline"}
                onClick={() => setSelectedPriority(priority)}
              >
                <Badge variant={getPriorityColor(priority)} className="mr-1">
                  {priority}
                </Badge>
                ({recommendations.filter(r => r.priority === priority).length})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations List */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredRecommendations.map((recommendation) => {
          const categoryInfo = getCategoryInfo(recommendation.type);
          return (
            <Card 
              key={recommendation.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedRecommendation(recommendation)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${categoryInfo?.color} text-white`}>
                      {categoryInfo?.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg leading-tight">{recommendation.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getPriorityColor(recommendation.priority)}>
                          {recommendation.priority}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {categoryInfo?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <CardDescription>{recommendation.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {/* Impact */}
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 mb-1">Expected Impact</p>
                    <p className="text-sm text-blue-700">{recommendation.impact}</p>
                  </div>
                  
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Implementation</p>
                      <p className={`font-medium capitalize ${getDifficultyColor(recommendation.implementation_difficulty)}`}>
                        {recommendation.implementation_difficulty}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Time needed</p>
                      <p className="font-medium">{recommendation.time_to_implement}</p>
                    </div>
                  </div>
                  
                  {recommendation.potential_savings && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Potential savings:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(recommendation.potential_savings)}
                      </span>
                    </div>
                  )}
                  
                  {/* Confidence Score */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Confidence Score</span>
                      <span className="font-medium">{recommendation.confidence_score}%</span>
                    </div>
                    <Progress value={recommendation.confidence_score} className="h-2" />
                  </div>
                  
                  {/* View Details */}
                  <div className="flex justify-end pt-2">
                    <Button size="sm" variant="outline">
                      View Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredRecommendations.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Lightbulb className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No recommendations found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or check back later for new recommendations
            </p>
            <Button onClick={() => {
              setSelectedCategory(null);
              setSelectedPriority(null);
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Detailed Recommendation Modal */}
      {selectedRecommendation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${getCategoryInfo(selectedRecommendation.type)?.color} text-white`}>
                    {getCategoryInfo(selectedRecommendation.type)?.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{selectedRecommendation.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getPriorityColor(selectedRecommendation.priority)}>
                        {selectedRecommendation.priority} priority
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {getCategoryInfo(selectedRecommendation.type)?.name}
                      </span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedRecommendation(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-gray-700">{selectedRecommendation.description}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Expected Impact</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-800">{selectedRecommendation.impact}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Action Items</h4>
                  <div className="space-y-2">
                    {selectedRecommendation.action_items.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-gray-700 flex-1">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Implementation Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Difficulty:</span>
                        <span className={`font-medium capitalize ${getDifficultyColor(selectedRecommendation.implementation_difficulty)}`}>
                          {selectedRecommendation.implementation_difficulty}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time required:</span>
                        <span className="font-medium">{selectedRecommendation.time_to_implement}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confidence:</span>
                        <span className="font-medium">{selectedRecommendation.confidence_score}%</span>
                      </div>
                      {selectedRecommendation.potential_savings && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Potential savings:</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(selectedRecommendation.potential_savings)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Expected Outcome</h4>
                    <p className="text-gray-700">{selectedRecommendation.expected_outcome}</p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setSelectedRecommendation(null)}>
                    Close
                  </Button>
                  <Button>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Implemented
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  DollarSign, 
  AlertCircle, 
  Plus,
  Target,
  Lightbulb,
  Calendar,
  Activity,
  Shield,
  BarChart3
} from 'lucide-react'
import { usePortfolios } from '@/hooks/usePortfolios'
import { useAuth } from '@/contexts/AuthContext'
import { RecommendationsCard } from '@/components/recommendations/RecommendationsCard'
import { CreatePortfolioModal } from '@/components/portfolios/CreatePortfolioModal'
import { CreateGoalModal } from '@/components/goals/CreateGoalModal'
import { Link } from 'react-router-dom'

export function Dashboard() {
  const { user } = useAuth()
  const { data: portfolioData, isLoading: portfoliosLoading, error: portfoliosError } = usePortfolios()
  
  // TODO: Add useGoals and useTransactions hooks when implemented
  // const { data: goalsData, isLoading: goalsLoading } = useGoals()
  // const { data: transactionsData, isLoading: transactionsLoading } = useTransactions({ limit: 10 })
  
  // Mock data for MVP demonstration
  const mockGoals = [
    {
      id: 1,
      name: 'Retirement Fund',
      target_amount: 500000,
      current_amount: 125000,
      progress_percentage: 25,
      target_date: '2045-12-31',
      category: 'retirement'
    },
    {
      id: 2,
      name: 'Emergency Fund',
      target_amount: 25000,
      current_amount: 18000,
      progress_percentage: 72,
      target_date: '2024-12-31',
      category: 'emergency'
    }
  ]

  const mockRecentActivity = [
    {
      id: 1,
      type: 'portfolio_update',
      description: 'Portfolio value increased by 2.3%',
      date: new Date().toISOString(),
      amount: null
    },
    {
      id: 2,
      type: 'goal_contribution',
      description: 'Added $1,000 to Emergency Fund',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 1000
    }
  ]

  const isLoading = portfoliosLoading
  const hasError = portfoliosError

  // Get current date and time
  const currentDate = new Date()
  const formattedDate = currentDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatPercent = (percent: number | string | undefined | null) => {
    const numValue = typeof percent === 'number' ? percent : parseFloat(String(percent || 0))
    const safeValue = isNaN(numValue) ? 0 : numValue
    return `${safeValue >= 0 ? '+' : ''}${safeValue.toFixed(1)}%`
  }


  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Loading your portfolio data...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Show error state
  if (hasError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <Card className="border-red-200">
          <CardContent className="flex items-center space-x-2 p-6">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-red-800 font-medium">Failed to load portfolio data</p>
              <p className="text-red-600 text-sm">Please try refreshing the page or contact support if the issue persists.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Welcome back, {user?.first_name || 'there'}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              {formattedDate} • Last login: {user?.last_login ? new Date(user.last_login).toLocaleDateString() : 'First time'}
            </p>
            <p className="text-gray-700 mt-2">
              Here's your financial overview and personalized recommendations to help you reach your goals.
            </p>
          </div>
          
          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
            <CreatePortfolioModal>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Portfolio
              </Button>
            </CreatePortfolioModal>
            
            <CreateGoalModal>
              <Button variant="outline" className="border-blue-200 hover:bg-blue-50">
                <Target className="h-4 w-4 mr-2" />
                Set Goal
              </Button>
            </CreateGoalModal>
            
            <Link to="/recommendations">
              <Button variant="outline" className="border-blue-200 hover:bg-blue-50">
                <Lightbulb className="h-4 w-4 mr-2" />
                View Recommendations
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(portfolioData?.total_value || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercent(portfolioData?.total_return_percent || 0)} from cost basis
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
            {(portfolioData?.total_gain_loss || 0) >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(portfolioData?.total_gain_loss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(portfolioData?.total_gain_loss || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Since inception
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Change</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +$156.43
            </div>
            <p className="text-xs text-muted-foreground">
              +0.42% today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Portfolios</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioData?.portfolios_count || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across different strategies
            </p>
          </CardContent>
        </Card>
        
      </div>

      {/* Goal Progress Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Your Financial Goals
            </CardTitle>
            <Link to="/goals">
              <Button variant="outline" size="sm">
                View All Goals
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {mockGoals.length > 0 ? (
            <div className="space-y-4">
              {mockGoals.map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{goal.name}</h4>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(goal.current_amount)} of {formatCurrency(goal.target_amount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{goal.progress_percentage}%</div>
                      <div className="text-sm text-gray-500">
                        Target: {new Date(goal.target_date).getFullYear()}
                      </div>
                    </div>
                  </div>
                  <Progress value={goal.progress_percentage} className="h-2" />
                  {goal.progress_percentage >= 75 && (
                    <p className="text-xs text-green-600 font-medium">
                      🎉 You're almost there! Great progress on this goal.
                    </p>
                  )}
                </div>
              ))}
              <div className="pt-2 text-center">
                <CreateGoalModal>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                    <Plus className="h-4 w-4 mr-1" />
                    Add New Goal
                  </Button>
                </CreateGoalModal>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No goals set yet</h3>
              <p className="text-gray-600 mb-4">
                Start your financial journey by setting your first goal
              </p>
              <CreateGoalModal>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Goal
                </Button>
              </CreateGoalModal>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Portfolio Performance - 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Portfolio Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Portfolio performance chart coming soon</p>
                <p className="text-sm">Will show your investment performance over time</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Activity Feed - 1 column */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockRecentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'portfolio_update' ? 'bg-green-500' :
                    activity.type === 'goal_contribution' ? 'bg-blue-500' : 'bg-gray-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                      {activity.amount && (
                        <span className="text-xs font-medium text-green-600">
                          {formatCurrency(activity.amount)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                  View all activity →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Quick Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">85</div>
              <div className="text-sm text-green-700">Portfolio Health Score</div>
              <div className="text-xs text-green-600 mt-1">Excellent diversification</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">Aligned</div>
              <div className="text-sm text-blue-700">Risk Tolerance</div>
              <div className="text-xs text-blue-600 mt-1">Matches your profile</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">2</div>
              <div className="text-sm text-orange-700">Rebalancing Needed</div>
              <div className="text-xs text-orange-600 mt-1">Review recommendations</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment Recommendations */}
      <RecommendationsCard />
    </div>
  )
}
import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/common'
import { RecommendationsCenter } from '../components/recommendations/RecommendationsCenter'
import { useProfileStore } from '../stores/profileStore'
import { RecommendationEngine } from '../services/recommendations'
import { TrendingUp, Target, DollarSign, AlertCircle, Plus, ArrowRight } from 'lucide-react'
import type { Recommendation } from '../types/recommendations'
import { RecommendationType, RecommendationPriority } from '../types/enums'
import { mockHoldings, mockGoals, calculatePortfolioMetrics, calculateGoalMetrics } from '../utils/mockData'

export const Dashboard: React.FC = () => {
  const { profile } = useProfileStore()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [, setIsLoadingRecommendations] = useState(false)

  // Memoize recommendations generation to avoid unnecessary recalculations
  const generatedRecommendations = useMemo(() => {
    if (!profile) return []
    
    try {
      return RecommendationEngine.generateRecommendations(
        profile,
        mockHoldings,
        [] // Mock goals - would come from goals store
      )
    } catch (error) {
      console.error('Error generating recommendations:', error)
      // Return fallback recommendations with proper typing
      return [{
        id: 'rec-fallback-1',
        userId: profile.id,
        type: RecommendationType.ALLOCATION,
        priority: RecommendationPriority.HIGH,
        title: 'Diversify Your Portfolio',
        description: 'Add international exposure to reduce risk and improve returns',
        rationale: 'Your portfolio is currently concentrated in domestic stocks.',
        actionItems: [
          { id: 'action-1', description: 'Research international index funds', completed: false }
        ],
        expectedImpact: { riskReduction: 15, returnImprovement: 8 },
        implementationDifficulty: 'easy' as const,
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        reasoning: 'Your portfolio lacks diversification',
        implemented: false
      }]
    }
  }, [profile])

  // Update recommendations when generated recommendations change
  useEffect(() => {
    setIsLoadingRecommendations(true)
    // Simulate async operation for better UX
    const timer = setTimeout(() => {
      setRecommendations(generatedRecommendations)
      setIsLoadingRecommendations(false)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [generatedRecommendations])

  // Calculate portfolio metrics from mock holdings
  const portfolioMetrics = useMemo(() => {
    const portfolioData = calculatePortfolioMetrics(mockHoldings)
    const goalData = calculateGoalMetrics(mockGoals)
    
    return {
      totalValue: portfolioData.totalValue,
      totalGain: portfolioData.totalGain,
      gainPercent: portfolioData.gainPercent,
      activeGoals: goalData.totalGoals,
      monthlyProgress: goalData.monthlyProgress
    }
  }, [])

  const handleImplementRecommendation = (recommendationId: string) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === recommendationId 
          ? { ...rec, status: 'in_progress' as const }
          : rec
      )
    )
    // In a real app, this would call a service to implement the recommendation
    console.log('Implementing recommendation:', recommendationId)
  }

  const handleDismissRecommendation = (recommendationId: string) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === recommendationId 
          ? { ...rec, status: 'dismissed' as const }
          : rec
      )
    )
    console.log('Dismissing recommendation:', recommendationId)
  }

  const handleViewRecommendationDetails = (recommendationId: string) => {
    console.log('Viewing recommendation details:', recommendationId)
    // Navigate to detailed view or open modal
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}, {profile?.personalInfo?.name || profile?.name || 'there'}!
            </h1>
            <p className="text-primary-100 text-lg">
              Here's your financial overview and personalized recommendations
            </p>
          </div>
          <div className="hidden md:block">
            <TrendingUp className="w-16 h-16 text-primary-200" />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(portfolioMetrics.totalValue)}
            </div>
            <div className="flex items-center text-sm">
              <span className={`font-medium ${portfolioMetrics.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {portfolioMetrics.totalGain >= 0 ? '+' : ''}{formatCurrency(portfolioMetrics.totalGain)} ({portfolioMetrics.gainPercent.toFixed(1)}%)
              </span>
              <span className="text-gray-500 ml-2">this year</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{portfolioMetrics.activeGoals}</div>
            <div className="flex items-center text-sm">
              <span className="text-green-600 font-medium">
                +{formatCurrency(portfolioMetrics.monthlyProgress)}
              </span>
              <span className="text-gray-500 ml-2">monthly progress</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {recommendations.filter(r => r.status === 'pending').length}
            </div>
            <div className="flex items-center text-sm">
              <span className="text-orange-600 font-medium">
                {recommendations.filter(r => r.priority === 'high').length} high priority
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations Section */}
      <div>
        <RecommendationsCenter
          recommendations={recommendations}
          onImplement={handleImplementRecommendation}
          onDismiss={handleDismissRecommendation}
          onViewDetails={handleViewRecommendationDetails}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Add Holdings
                </h3>
                <p className="text-gray-600 text-sm">
                  Track your investments to get better recommendations
                </p>
              </div>
              <Link to="/portfolio">
                <Button className="flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Set Goals
                </h3>
                <p className="text-gray-600 text-sm">
                  Define your financial objectives and track progress
                </p>
              </div>
              <Link to="/goals">
                <Button variant="outline" className="flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Set Goals
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Link to="/analysis">
              <Button variant="ghost" size="sm" className="flex items-center">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-900">Portfolio rebalanced automatically</span>
              </div>
              <span className="text-sm text-gray-500">2 days ago</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-900">New recommendation: Increase bond allocation</span>
              </div>
              <span className="text-sm text-gray-500">1 week ago</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-900">Goal progress: Emergency fund 75% complete</span>
              </div>
              <span className="text-sm text-gray-500">2 weeks ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
import type {
  Holding,
  UserProfile,
  Goal,
  Recommendation
} from '../types'
import {
  RecommendationType,
  RecommendationPriority,
  SecurityType,
  GoalCategory
} from '../types/enums'

// Mock analytics functions for now - these would be implemented in analytics.ts
const PortfolioAnalytics = {
  calculateTotalValue: (holdings: Holding[]) => 
    holdings.reduce((sum, h) => sum + (h.quantity * (h.currentPrice || h.purchasePrice)), 0),
  
  analyzeDiversification: () => ({ 
    overallScore: 75, 
    recommendations: ['Add international exposure', 'Consider bonds'] 
  }),
  
  calculateRiskMetrics: (holdings: Holding[]) => {
    const totalValue = PortfolioAnalytics.calculateTotalValue(holdings)
    const concentrationRisk = holdings.length > 0 
      ? Math.max(...holdings.map(h => ((h.quantity * (h.currentPrice || h.purchasePrice)) / totalValue) * 100))
      : 0
    
    return { 
      riskLevel: 'medium', 
      concentrationRisk
    }
  },
  
  generateAllocationBreakdown: (holdings: Holding[]) => {
    const total = PortfolioAnalytics.calculateTotalValue(holdings)
    if (total === 0) return []
    
    const breakdown = new Map<string, number>()
    holdings.forEach(h => {
      const value = h.quantity * (h.currentPrice || h.purchasePrice)
      const pct = (value / total) * 100
      const assetType = h.securityType.toLowerCase()
      breakdown.set(assetType, (breakdown.get(assetType) || 0) + pct)
    })
    
    return Array.from(breakdown.entries()).map(([securityType, percentage]) => ({ 
      securityType, 
      percentage 
    }))
  },
  
  suggestTargetAllocation: (profile: UserProfile) => {
    const age = profile.personalInfo?.age || profile.age || 30
    const stockPct = Math.max(20, Math.min(90, 100 - age))
    return { stocks: stockPct, bonds: 100 - stockPct }
  },
  
  calculateHoldingMetrics: (holding: Holding) => {
    const currentPrice = holding.currentPrice || holding.purchasePrice
    return {
      currentValue: holding.quantity * currentPrice,
      gainLoss: (currentPrice - holding.purchasePrice) * holding.quantity,
      gainLossPercent: ((currentPrice - holding.purchasePrice) / holding.purchasePrice) * 100
    }
  }
}

interface DiversificationScore {
  overallScore: number
  recommendations: string[]
}

interface TargetAllocation {
  stocks: number
  bonds: number
}

// Constants for recommendation thresholds
export const RECOMMENDATION_THRESHOLDS = {
  ALLOCATION_GAP_THRESHOLD: 10, // Percentage
  HIGH_ALLOCATION_GAP_THRESHOLD: 20, // Percentage
  MIN_BOND_ALLOCATION: 10, // Percentage
  MIN_BOND_AGE: 30, // Years
  HIGH_CONCENTRATION_RISK: 50, // Percentage
  MEDIUM_CONCENTRATION_RISK: 30, // Percentage
  LOW_DIVERSIFICATION_THRESHOLD: 40, // Score
  MEDIUM_DIVERSIFICATION_THRESHOLD: 60, // Score
  GOAL_URGENT_DAYS: 365, // Days
  GOAL_URGENT_PROGRESS: 80, // Percentage
  GOAL_LOW_PROGRESS: 25, // Percentage
  REBALANCE_THRESHOLD: 40, // Percentage
  SMALL_POSITION_THRESHOLD: 0.05, // 5% of portfolio
  DAYS_PER_MONTH: 30.44 // Average days per month
}

interface RecommendationContext {
  userProfile: UserProfile
  holdings: Holding[]
  goals: Goal[]
  portfolioValue: number
  diversificationScore: DiversificationScore
  riskMetrics: any
}

export class RecommendationEngine {
  
  static generateRecommendations(
    userProfile: UserProfile,
    holdings: Holding[] = [],
    goals: Goal[] = []
  ): Recommendation[] {
    const context = this.createContext(userProfile, holdings, goals)
    
    const rawRecommendations: any[] = []
    
    // Generate different types of recommendations
    rawRecommendations.push(...this.generateAllocationRecommendations(context))
    rawRecommendations.push(...this.generateRiskRecommendations(context))
    rawRecommendations.push(...this.generateDiversificationRecommendations(context))
    rawRecommendations.push(...this.generateGoalRecommendations(context))
    rawRecommendations.push(...this.generateRebalancingRecommendations(context))
    rawRecommendations.push(...this.generateCostRecommendations(context))
    
    // Convert to full Recommendation objects
    const recommendations: Recommendation[] = rawRecommendations.map((rec, index) => ({
      id: `rec-${Date.now()}-${index}`,
      userId: userProfile.id,
      type: rec.type,
      priority: rec.priority,
      title: rec.title,
      description: rec.description,
      rationale: rec.reasoning,
      actionItems: rec.actionItems.map((item: string, itemIndex: number) => ({
        id: `action-${Date.now()}-${index}-${itemIndex}`,
        description: item,
        completed: false
      })),
      expectedImpact: {
        riskReduction: rec.type === RecommendationType.RISK_MANAGEMENT ? 15 : undefined,
        returnImprovement: rec.type === RecommendationType.ALLOCATION ? 8 : undefined,
        goalAcceleration: rec.type === RecommendationType.GOAL_ACHIEVEMENT ? 10 : undefined
      },
      implementationDifficulty: 'easy' as const,
      status: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      reasoning: rec.reasoning,
      implemented: false
    }))
    
    // Sort by priority and return
    return this.sortFullRecommendations(recommendations)
  }

  private static createContext(
    userProfile: UserProfile,
    holdings: Holding[],
    goals: Goal[]
  ): RecommendationContext {
    const portfolioValue = PortfolioAnalytics.calculateTotalValue(holdings)
    const diversificationScore = PortfolioAnalytics.analyzeDiversification()
    const riskMetrics = PortfolioAnalytics.calculateRiskMetrics(holdings)
    
    return {
      userProfile,
      holdings,
      goals,
      portfolioValue,
      diversificationScore,
      riskMetrics
    }
  }

  private static generateAllocationRecommendations(context: RecommendationContext): any[] {
    const recommendations: any[] = []
    
    if (!context.holdings.length) {
      return recommendations
    }
    
    // Calculate current allocation
    const allocations = PortfolioAnalytics.generateAllocationBreakdown(context.holdings)
    
    // Get target allocation based on user profile
    const targetAllocation = PortfolioAnalytics.suggestTargetAllocation(context.userProfile)
    
    // Calculate current equity allocation (stocks + ETFs)
    const currentStocks = allocations.find(a => a.securityType === 'stock')?.percentage || 0
    const currentETFs = allocations.find(a => a.securityType === 'etf')?.percentage || 0
    const currentEquity = currentStocks + currentETFs
    const targetEquity = targetAllocation.stocks
    
    const equityGap = targetEquity - currentEquity
    
    if (Math.abs(equityGap) > RECOMMENDATION_THRESHOLDS.ALLOCATION_GAP_THRESHOLD) {
      if (equityGap > 0) {
        // Need more equity
        const priority = Math.abs(equityGap) > RECOMMENDATION_THRESHOLDS.HIGH_ALLOCATION_GAP_THRESHOLD 
          ? RecommendationPriority.HIGH 
          : RecommendationPriority.MEDIUM
        
        recommendations.push({
          type: RecommendationType.ALLOCATION,
          priority,
          title: "Increase Equity Allocation",
          description: `Your current equity allocation is ${currentEquity.toFixed(1)}%, but based on your profile, you should have around ${targetEquity.toFixed(1)}%.`,
          reasoning: `Given your ${context.userProfile.riskTolerance} risk tolerance and ${context.userProfile.goals?.timeHorizon?.replace('_', ' ') || 'long-term'} time horizon, a higher equity allocation could help you achieve better long-term returns.`,
          actionItems: [
            `Consider adding ${equityGap.toFixed(1)}% more in stocks or equity ETFs`,
            "Look for low-cost broad market index funds",
            "Dollar-cost average into new positions over time"
          ]
        })
      } else {
        // Too much equity
        recommendations.push({
          type: RecommendationType.ALLOCATION,
          priority: RecommendationPriority.MEDIUM,
          title: "Reduce Equity Concentration",
          description: `Your equity allocation is ${currentEquity.toFixed(1)}%, which may be too high for your risk profile (target: ${targetEquity.toFixed(1)}%).`,
          reasoning: `With your ${context.userProfile.riskTolerance} risk tolerance, a more balanced allocation could provide better risk-adjusted returns.`,
          actionItems: [
            `Consider reducing equity allocation by ${Math.abs(equityGap).toFixed(1)}%`,
            "Add bonds or fixed-income investments",
            "Rebalance gradually to avoid tax implications"
          ]
        })
      }
    }
    
    // Check for missing asset classes
    const currentBonds = allocations.find(a => a.securityType === 'bond')?.percentage || 0
    
    if (currentBonds < RECOMMENDATION_THRESHOLDS.MIN_BOND_ALLOCATION && (context.userProfile.personalInfo?.age || context.userProfile.age || 0) > RECOMMENDATION_THRESHOLDS.MIN_BOND_AGE) {
      recommendations.push({
        type: RecommendationType.ALLOCATION,
        priority: RecommendationPriority.MEDIUM,
        title: "Add Bond Allocation",
        description: "Your portfolio lacks fixed-income investments, which can provide stability and diversification.",
        reasoning: "Bonds can reduce portfolio volatility and provide steady income, especially important as you approach retirement.",
        actionItems: [
          "Consider adding 10-30% in bonds or bond funds",
          "Look at government bonds, corporate bonds, or bond ETFs",
          "Start with broad bond market index funds"
        ]
      })
    }
    
    return recommendations
  }

  private static generateRiskRecommendations(context: RecommendationContext): any[] {
    const recommendations: any[] = []
    
    // Check risk alignment
    const userRisk = (context.userProfile.investmentProfile?.riskTolerance || context.userProfile.riskTolerance).toLowerCase()
    const portfolioRisk = context.riskMetrics.riskLevel.toLowerCase()
    
    if (userRisk !== portfolioRisk) {
      if (userRisk === 'conservative' && ['medium', 'high'].includes(portfolioRisk)) {
        recommendations.push({
          type: RecommendationType.RISK_MANAGEMENT,
          priority: RecommendationPriority.HIGH,
          title: "Reduce Portfolio Risk",
          description: `Your portfolio risk level (${portfolioRisk}) is higher than your stated risk tolerance (${userRisk}).`,
          reasoning: "Aligning your portfolio risk with your comfort level can help you stay invested during market volatility.",
          actionItems: [
            "Increase allocation to bonds and stable investments",
            "Reduce concentration in volatile assets",
            "Consider adding defensive stocks or dividend-paying stocks"
          ]
        })
      } else if (userRisk === 'aggressive' && portfolioRisk === 'low') {
        recommendations.push({
          type: RecommendationType.RISK_MANAGEMENT,
          priority: RecommendationPriority.MEDIUM,
          title: "Consider Higher Growth Potential",
          description: `Your portfolio is quite conservative (${portfolioRisk}) compared to your aggressive risk tolerance.`,
          reasoning: "With your high risk tolerance and long time horizon, you might be missing growth opportunities.",
          actionItems: [
            "Consider adding growth stocks or growth ETFs",
            "Reduce cash and bond allocations",
            "Look into emerging markets or sector-specific investments"
          ]
        })
      }
    }
    
    // Concentration risk
    if (context.riskMetrics.concentrationRisk > RECOMMENDATION_THRESHOLDS.MEDIUM_CONCENTRATION_RISK) {
      const priority = context.riskMetrics.concentrationRisk > RECOMMENDATION_THRESHOLDS.HIGH_CONCENTRATION_RISK
        ? RecommendationPriority.HIGH
        : RecommendationPriority.MEDIUM
      
      recommendations.push({
        type: RecommendationType.RISK_MANAGEMENT,
        priority,
        title: "Reduce Concentration Risk",
        description: `Your largest holding represents ${context.riskMetrics.concentrationRisk.toFixed(1)}% of your portfolio.`,
        reasoning: "High concentration in a single investment increases risk. Diversification can help protect against individual stock volatility.",
        actionItems: [
          "Consider reducing your largest position to under 20% of portfolio",
          "Diversify into other sectors or asset classes",
          "Use dollar-cost averaging to build other positions"
        ]
      })
    }
    
    return recommendations
  }

  private static generateDiversificationRecommendations(context: RecommendationContext): any[] {
    const recommendations: any[] = []
    
    // Use diversification analysis
    if (context.diversificationScore.overallScore < RECOMMENDATION_THRESHOLDS.MEDIUM_DIVERSIFICATION_THRESHOLD) {
      const priority = context.diversificationScore.overallScore < RECOMMENDATION_THRESHOLDS.LOW_DIVERSIFICATION_THRESHOLD
        ? RecommendationPriority.HIGH
        : RecommendationPriority.MEDIUM
      
      recommendations.push({
        type: RecommendationType.ALLOCATION,
        priority,
        title: "Improve Portfolio Diversification",
        description: `Your diversification score is ${context.diversificationScore.overallScore}/100, indicating room for improvement.`,
        reasoning: "Better diversification can reduce risk while maintaining return potential by spreading investments across different asset types and sectors.",
        actionItems: context.diversificationScore.recommendations
      })
    }
    
    // Check for international diversification
    const hasInternational = this.hasInternationalExposure(context.holdings)
    
    if (!hasInternational && context.holdings.length > 3) {
      recommendations.push({
        type: RecommendationType.ALLOCATION,
        priority: RecommendationPriority.MEDIUM,
        title: "Add International Exposure",
        description: "Your portfolio appears to lack international diversification.",
        reasoning: "International investments can provide exposure to different economic cycles and growth opportunities outside your home market.",
        actionItems: [
          "Consider adding 10-20% international equity exposure",
          "Look at international index funds or ETFs",
          "Consider both developed and emerging markets"
        ]
      })
    }
    
    return recommendations
  }

  private static generateGoalRecommendations(context: RecommendationContext): any[] {
    const recommendations: any[] = []
    
    if (!context.goals.length) {
      // Suggest setting goals
      recommendations.push({
        type: RecommendationType.GOAL_ACHIEVEMENT,
        priority: RecommendationPriority.MEDIUM,
        title: "Set Financial Goals",
        description: "You haven't set any financial goals yet. Goals help guide investment decisions and track progress.",
        reasoning: "Having clear financial goals helps determine appropriate asset allocation, risk level, and savings rate.",
        actionItems: [
          "Set a retirement savings goal",
          "Consider an emergency fund goal",
          "Define any major purchase goals (house, education, etc.)"
        ]
      })
      return recommendations
    }
    
    // Analyze goal progress and timeline
    for (const goal of context.goals) {
      const daysRemaining = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      const progressPercentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
      
      if (daysRemaining < RECOMMENDATION_THRESHOLDS.GOAL_URGENT_DAYS && progressPercentage < RECOMMENDATION_THRESHOLDS.GOAL_URGENT_PROGRESS) {
        // Goal is due soon but not on track
        const monthsRemaining = daysRemaining / RECOMMENDATION_THRESHOLDS.DAYS_PER_MONTH
        const remainingAmount = goal.targetAmount - goal.currentAmount
        const monthlyNeeded = monthsRemaining > 0 ? remainingAmount / monthsRemaining : remainingAmount
        
        recommendations.push({
          type: RecommendationType.GOAL_ACHIEVEMENT,
          priority: RecommendationPriority.HIGH,
          title: `Accelerate Progress on ${goal.name}`,
          description: `Your goal '${goal.name}' is due in ${daysRemaining} days but only ${progressPercentage.toFixed(1)}% complete.`,
          reasoning: "With limited time remaining, you may need to increase contributions or adjust the goal timeline.",
          actionItems: [
            `Increase monthly contributions by $${monthlyNeeded.toFixed(0)}`,
            "Consider extending the target date if realistic",
            "Review and reduce other expenses to free up money"
          ]
        })
      } else if (progressPercentage < RECOMMENDATION_THRESHOLDS.GOAL_LOW_PROGRESS && daysRemaining > RECOMMENDATION_THRESHOLDS.GOAL_URGENT_DAYS) {
        // Goal has time but low progress
        const monthsRemaining = daysRemaining / RECOMMENDATION_THRESHOLDS.DAYS_PER_MONTH
        const remainingAmount = goal.targetAmount - goal.currentAmount
        const monthlyNeeded = monthsRemaining > 0 ? remainingAmount / monthsRemaining : 0
        
        recommendations.push({
          type: RecommendationType.GOAL_ACHIEVEMENT,
          priority: RecommendationPriority.MEDIUM,
          title: `Start Building Momentum on ${goal.name}`,
          description: `Your goal '${goal.name}' has good time remaining but low progress (${progressPercentage.toFixed(1)}%).`,
          reasoning: "Starting consistent contributions now will help you reach your goal through compound growth.",
          actionItems: [
            `Set up automatic monthly contributions of $${monthlyNeeded.toFixed(0)}`,
            "Consider increasing contributions as income grows",
            "Review progress quarterly and adjust as needed"
          ]
        })
      }
    }
    
    // Check if emergency fund goal exists
    const hasEmergencyGoal = context.goals.some(goal => goal.category === GoalCategory.EMERGENCY)
    if (!hasEmergencyGoal && (context.userProfile.personalInfo?.age || context.userProfile.age || 0) < 65) {
      recommendations.push({
        type: RecommendationType.GOAL_ACHIEVEMENT,
        priority: RecommendationPriority.HIGH,
        title: "Create Emergency Fund Goal",
        description: "You don't have an emergency fund goal, which is crucial for financial security.",
        reasoning: "An emergency fund covering 3-6 months of expenses protects against unexpected financial setbacks.",
        actionItems: [
          "Set an emergency fund goal for 3-6 months of expenses",
          "Keep emergency funds in high-yield savings or money market",
          "Build this fund before focusing on other investment goals"
        ]
      })
    }
    
    return recommendations
  }

  private static generateRebalancingRecommendations(context: RecommendationContext): any[] {
    const recommendations: any[] = []
    
    if (context.holdings.length < 3) {
      return recommendations
    }
    
    // Check if rebalancing is needed based on concentration
    if (context.riskMetrics.concentrationRisk > RECOMMENDATION_THRESHOLDS.REBALANCE_THRESHOLD) {
      recommendations.push({
        type: RecommendationType.REBALANCING,
        priority: RecommendationPriority.MEDIUM,
        title: "Rebalance Overweight Positions",
        description: `Your largest holding represents ${context.riskMetrics.concentrationRisk.toFixed(1)}% of your portfolio.`,
        reasoning: "Regular rebalancing helps maintain your target allocation and can improve risk-adjusted returns.",
        actionItems: [
          "Trim overweight positions gradually",
          "Reinvest proceeds into underweight asset classes",
          "Consider tax implications when rebalancing in taxable accounts"
        ]
      })
    }
    
    // Check for holdings that haven't been updated recently
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const staleHoldings = context.holdings.filter(h => 
      !h.currentPrice || new Date(h.lastUpdated) < thirtyDaysAgo
    )
    
    if (staleHoldings.length > 0) {
      recommendations.push({
        type: RecommendationType.REBALANCING,
        priority: RecommendationPriority.LOW,
        title: "Update Holding Prices",
        description: `${staleHoldings.length} holdings have outdated prices, affecting portfolio analysis accuracy.`,
        reasoning: "Accurate current prices are essential for proper portfolio analysis and rebalancing decisions.",
        actionItems: [
          "Update current prices for all holdings",
          "Set up regular price updates (monthly or quarterly)",
          "Use reliable financial data sources for pricing"
        ]
      })
    }
    
    return recommendations
  }

  private static generateCostRecommendations(context: RecommendationContext): any[] {
    const recommendations: any[] = []
    
    // Check for high-cost investments (simplified analysis)
    const highCostHoldings = context.holdings.filter(h => h.securityType === SecurityType.MUTUAL_FUND)
    
    if (highCostHoldings.length > 0 && context.holdings.length > 2) {
      recommendations.push({
        type: RecommendationType.COST_REDUCTION,
        priority: RecommendationPriority.LOW,
        title: "Review Investment Costs",
        description: `You have ${highCostHoldings.length} mutual funds which may have higher fees than ETF alternatives.`,
        reasoning: "Lower investment costs directly improve your returns over time. Even small fee differences compound significantly.",
        actionItems: [
          "Research expense ratios of your mutual funds",
          "Consider low-cost ETF alternatives",
          "Prioritize index funds over actively managed funds"
        ]
      })
    }
    
    // Suggest consolidation if too many small positions
    const smallPositions = context.holdings.filter(h => {
      const metrics = PortfolioAnalytics.calculateHoldingMetrics(h)
      return metrics.currentValue < context.portfolioValue * RECOMMENDATION_THRESHOLDS.SMALL_POSITION_THRESHOLD
    })
    
    if (smallPositions.length > 5) {
      recommendations.push({
        type: RecommendationType.COST_REDUCTION,
        priority: RecommendationPriority.LOW,
        title: "Consider Position Consolidation",
        description: `You have ${smallPositions.length} positions representing less than 5% each of your portfolio.`,
        reasoning: "Too many small positions can be difficult to manage and may increase transaction costs.",
        actionItems: [
          "Consider consolidating very small positions",
          "Focus on building larger positions in your best ideas",
          "Reduce complexity while maintaining diversification"
        ]
      })
    }
    
    return recommendations
  }

  private static sortFullRecommendations(recommendations: Recommendation[]): Recommendation[] {
    const priorityWeights = {
      [RecommendationPriority.HIGH]: 3,
      [RecommendationPriority.MEDIUM]: 2,
      [RecommendationPriority.LOW]: 1
    }
    
    return recommendations.sort((a, b) => {
      const weightA = priorityWeights[a.priority] || 0
      const weightB = priorityWeights[b.priority] || 0
      return weightB - weightA
    })
  }

  private static hasInternationalExposure(holdings: Holding[]): boolean {
    const internationalKeywords = ['international', 'global', 'world', 'emerging', 'foreign']
    
    return holdings.some(holding =>
      internationalKeywords.some(keyword =>
        (holding.securityName || '').toLowerCase().includes(keyword)
      )
    )
  }

  static analyzeAssetAllocation(holdings: Holding[], targetAllocation: TargetAllocation) {
    const currentAllocations = PortfolioAnalytics.generateAllocationBreakdown(holdings)
    
    const analysis = {
      current: {} as Record<string, number>,
      target: targetAllocation,
      gaps: {} as Record<string, number>,
      recommendations: [] as string[]
    }
    
    // Map current allocations
    currentAllocations.forEach(allocation => {
      analysis.current[allocation.securityType.toLowerCase()] = allocation.percentage
    })
    
    // Calculate gaps
    Object.entries(targetAllocation).forEach(([assetClass, targetPct]) => {
      const currentPct = analysis.current[assetClass] || 0
      const gap = targetPct - currentPct
      analysis.gaps[assetClass] = gap
      
      if (Math.abs(gap) > 5) { // More than 5% difference
        if (gap > 0) {
          analysis.recommendations.push(`Increase ${assetClass} allocation by ${gap.toFixed(1)}%`)
        } else {
          analysis.recommendations.push(`Reduce ${assetClass} allocation by ${Math.abs(gap).toFixed(1)}%`)
        }
      }
    })
    
    return analysis
  }

  static assessRiskLevel(holdings: Holding[], userProfile: UserProfile) {
    const riskMetrics = PortfolioAnalytics.calculateRiskMetrics(holdings)
    
    const assessment = {
      portfolioRisk: riskMetrics.riskLevel,
      userRiskTolerance: userProfile.riskTolerance,
      concentrationRisk: riskMetrics.concentrationRisk,
      alignment: 'good' as 'good' | 'too_conservative' | 'too_aggressive',
      recommendations: [] as string[]
    }
    
    // Check alignment
    const portfolioRisk = riskMetrics.riskLevel.toLowerCase()
    const userRisk = userProfile.riskTolerance.toLowerCase()
    
    if (portfolioRisk !== userRisk) {
      if ((portfolioRisk === 'low' && ['moderate', 'aggressive'].includes(userRisk)) ||
          (portfolioRisk === 'medium' && userRisk === 'aggressive')) {
        assessment.alignment = 'too_conservative'
        assessment.recommendations.push('Consider adding more growth-oriented investments')
      } else if ((portfolioRisk === 'high' && ['conservative', 'moderate'].includes(userRisk)) ||
                 (portfolioRisk === 'medium' && userRisk === 'conservative')) {
        assessment.alignment = 'too_aggressive'
        assessment.recommendations.push('Consider reducing risk with more stable investments')
      }
    }
    
    return assessment
  }
}
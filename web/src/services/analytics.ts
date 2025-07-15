import type { 
  Holding, 
  UserProfile, 
  PortfolioSummary, 
  AllocationBreakdown, 
  PortfolioAnalysis,
  RiskMetrics,
  HoldingCalculations,
  SecurityType,
  RiskTolerance 
} from '../types'

export interface PerformanceMetrics {
  totalValue: number
  totalCostBasis: number
  totalGainLoss: number
  totalReturnPercent: number
  profitableHoldings: number
  losingHoldings: number
  bestPerformer?: string
  worstPerformer?: string
  bestReturnPercent: number
  worstReturnPercent: number
}

export interface DiversificationScore {
  overallScore: number  // 0-100
  securityTypeScore: number
  concentrationScore: number
  recommendations: string[]
}

export interface TargetAllocation {
  stocks: number
  bonds: number
  cash: number
  alternatives: number
}

export class PortfolioAnalytics {
  
  static calculateHoldingMetrics(holding: Holding): HoldingCalculations {
    const totalCostBasis = holding.quantity * holding.purchasePrice
    const currentPrice = holding.currentPrice || holding.purchasePrice
    const currentValue = holding.quantity * currentPrice
    const unrealizedGainLoss = currentValue - totalCostBasis
    const unrealizedGainLossPercent = totalCostBasis > 0 ? 
      (unrealizedGainLoss / totalCostBasis) * 100 : 0
    
    return {
      totalCostBasis,
      currentValue,
      unrealizedGainLoss,
      unrealizedGainLossPercent,
      isProfitable: unrealizedGainLoss > 0
    }
  }

  static calculateTotalValue(holdings: Holding[]): number {
    return holdings.reduce((total, holding) => {
      const metrics = this.calculateHoldingMetrics(holding)
      return total + metrics.currentValue
    }, 0)
  }

  static calculateTotalCostBasis(holdings: Holding[]): number {
    return holdings.reduce((total, holding) => {
      const metrics = this.calculateHoldingMetrics(holding)
      return total + metrics.totalCostBasis
    }, 0)
  }

  static calculatePerformanceMetrics(holdings: Holding[]): PerformanceMetrics {
    if (!holdings.length) {
      return {
        totalValue: 0,
        totalCostBasis: 0,
        totalGainLoss: 0,
        totalReturnPercent: 0,
        profitableHoldings: 0,
        losingHoldings: 0,
        bestReturnPercent: 0,
        worstReturnPercent: 0
      }
    }

    const totalValue = this.calculateTotalValue(holdings)
    const totalCostBasis = this.calculateTotalCostBasis(holdings)
    const totalGainLoss = totalValue - totalCostBasis
    const totalReturnPercent = totalCostBasis > 0 ? 
      (totalGainLoss / totalCostBasis) * 100 : 0

    // Analyze individual holdings
    const holdingMetrics = holdings.map(h => ({
      holding: h,
      metrics: this.calculateHoldingMetrics(h)
    }))

    const profitableHoldings = holdingMetrics.filter(h => h.metrics.isProfitable).length
    const losingHoldings = holdings.length - profitableHoldings

    // Find best and worst performers
    const sortedByReturn = holdingMetrics.sort((a, b) => 
      b.metrics.unrealizedGainLossPercent - a.metrics.unrealizedGainLossPercent
    )

    const bestPerformer = sortedByReturn[0]
    const worstPerformer = sortedByReturn[sortedByReturn.length - 1]

    return {
      totalValue,
      totalCostBasis,
      totalGainLoss,
      totalReturnPercent,
      profitableHoldings,
      losingHoldings,
      bestPerformer: bestPerformer?.holding.symbol,
      worstPerformer: worstPerformer?.holding.symbol,
      bestReturnPercent: bestPerformer?.metrics.unrealizedGainLossPercent || 0,
      worstReturnPercent: worstPerformer?.metrics.unrealizedGainLossPercent || 0
    }
  }

  static analyzeDiversification(holdings: Holding[]): DiversificationScore {
    if (!holdings.length) {
      return {
        overallScore: 0,
        securityTypeScore: 0,
        concentrationScore: 0,
        recommendations: ["Add holdings to your portfolio"]
      }
    }

    const totalValue = this.calculateTotalValue(holdings)
    const recommendations: string[] = []

    // Security type diversification (0-40 points)
    const securityTypes = new Set(holdings.map(h => h.securityType))
    const securityTypeScore = Math.min(securityTypes.size * 10, 40)

    if (securityTypes.size < 3) {
      recommendations.push("Consider diversifying across more asset types (stocks, bonds, ETFs)")
    }

    // Concentration analysis (0-60 points)
    let concentrationScore = 0
    if (totalValue > 0) {
      const holdingPercentages = holdings.map(h => {
        const metrics = this.calculateHoldingMetrics(h)
        return (metrics.currentValue / totalValue) * 100
      })
      
      const maxHoldingPercent = Math.max(...holdingPercentages)

      if (maxHoldingPercent > 50) {
        concentrationScore = 10
        recommendations.push("Your portfolio is heavily concentrated in one holding")
      } else if (maxHoldingPercent > 30) {
        concentrationScore = 25
        recommendations.push("Consider reducing concentration in your largest holding")
      } else if (maxHoldingPercent > 20) {
        concentrationScore = 40
      } else {
        concentrationScore = 60
      }

      // Check top 3 holdings concentration
      const top3Percent = holdingPercentages
        .sort((a, b) => b - a)
        .slice(0, 3)
        .reduce((sum, percent) => sum + percent, 0)
      
      if (top3Percent > 75) {
        recommendations.push("Your top 3 holdings represent over 75% of your portfolio")
      }
    }

    // Number of holdings assessment
    const numHoldings = holdings.length
    if (numHoldings < 5) {
      recommendations.push("Consider adding more holdings for better diversification")
    } else if (numHoldings > 50) {
      recommendations.push("You may be over-diversified - consider consolidating similar positions")
    }

    const overallScore = securityTypeScore + concentrationScore

    // Add positive recommendations for good diversification
    if (overallScore >= 80) {
      recommendations.push("Excellent diversification across asset types and holdings")
    } else if (overallScore >= 60) {
      recommendations.push("Good diversification with room for minor improvements")
    }

    return {
      overallScore,
      securityTypeScore,
      concentrationScore,
      recommendations
    }
  }

  static calculateRiskMetrics(holdings: Holding[], userProfile?: UserProfile): RiskMetrics {
    if (!holdings.length) {
      return {
        diversificationScore: 0,
        concentrationRisk: 0,
        volatilityScore: 0,
        riskLevel: 'LOW'
      }
    }

    const totalValue = this.calculateTotalValue(holdings)

    // Concentration risk (largest single holding)
    let concentrationRisk = 0
    if (totalValue > 0) {
      const holdingPercentages = holdings.map(h => {
        const metrics = this.calculateHoldingMetrics(h)
        return (metrics.currentValue / totalValue) * 100
      })
      concentrationRisk = Math.max(...holdingPercentages)
    }

    // Estimate volatility based on security types
    const volatilityWeights: Record<SecurityType, number> = {
      [SecurityType.CRYPTO]: 5,
      [SecurityType.STOCK]: 3,
      [SecurityType.ETF]: 2,
      [SecurityType.MUTUAL_FUND]: 2,
      [SecurityType.BOND]: 1,
      [SecurityType.CASH]: 0,
      [SecurityType.OTHER]: 2
    }

    let weightedVolatility = 0
    if (totalValue > 0) {
      weightedVolatility = holdings.reduce((sum, holding) => {
        const metrics = this.calculateHoldingMetrics(holding)
        const weight = metrics.currentValue / totalValue
        const volatility = volatilityWeights[holding.securityType] || 2
        return sum + (volatility * weight)
      }, 0)
    }

    // Calculate risk score (0-100, higher = riskier)
    let riskScore = 0

    // Concentration risk component (0-40 points)
    if (concentrationRisk > 50) {
      riskScore += 40
    } else if (concentrationRisk > 30) {
      riskScore += 30
    } else if (concentrationRisk > 20) {
      riskScore += 20
    } else if (concentrationRisk > 10) {
      riskScore += 10
    }

    // Volatility component (0-40 points)
    riskScore += Math.floor(weightedVolatility * 10)

    // Diversification component (0-20 points)
    if (holdings.length < 5) {
      riskScore += 20
    } else if (holdings.length < 10) {
      riskScore += 10
    }

    // Determine overall risk level
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
    if (riskScore >= 70) {
      riskLevel = 'HIGH'
    } else if (riskScore >= 40) {
      riskLevel = 'MEDIUM'
    } else {
      riskLevel = 'LOW'
    }

    // Diversification score (inverse of risk concentration)
    const diversificationScore = Math.max(100 - concentrationRisk, 0)

    return {
      diversificationScore,
      concentrationRisk,
      volatilityScore: weightedVolatility * 20, // Scale to 0-100
      riskLevel
    }
  }

  static generateAllocationBreakdown(holdings: Holding[]): AllocationBreakdown[] {
    if (!holdings.length) {
      return []
    }

    const totalValue = this.calculateTotalValue(holdings)
    const securityTypeMap = new Map<SecurityType, { value: number; count: number }>()

    holdings.forEach(holding => {
      const metrics = this.calculateHoldingMetrics(holding)
      const existing = securityTypeMap.get(holding.securityType) || { value: 0, count: 0 }
      securityTypeMap.set(holding.securityType, {
        value: existing.value + metrics.currentValue,
        count: existing.count + 1
      })
    })

    return Array.from(securityTypeMap.entries()).map(([securityType, data]) => ({
      securityType,
      value: data.value,
      percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
      count: data.count
    }))
  }

  static generatePortfolioSummary(holdings: Holding[]): PortfolioSummary {
    const performance = this.calculatePerformanceMetrics(holdings)
    
    return {
      totalValue: performance.totalValue,
      totalCostBasis: performance.totalCostBasis,
      totalGainLoss: performance.totalGainLoss,
      totalGainLossPercent: performance.totalReturnPercent,
      holdingsCount: holdings.length,
      lastUpdated: new Date()
    }
  }

  static generatePortfolioAnalysis(holdings: Holding[], userProfile?: UserProfile): PortfolioAnalysis {
    const summary = this.generatePortfolioSummary(holdings)
    const allocations = this.generateAllocationBreakdown(holdings)
    const riskMetrics = this.calculateRiskMetrics(holdings, userProfile)
    
    // Get top and worst performers
    const holdingMetrics = holdings.map(h => ({
      holding: h,
      metrics: this.calculateHoldingMetrics(h)
    }))

    const sortedByReturn = holdingMetrics.sort((a, b) => 
      b.metrics.unrealizedGainLossPercent - a.metrics.unrealizedGainLossPercent
    )

    const topPerformers = sortedByReturn.slice(0, 3).map(h => h.holding)
    const worstPerformers = sortedByReturn.slice(-3).map(h => h.holding)

    return {
      summary,
      allocations,
      topPerformers,
      worstPerformers,
      riskMetrics
    }
  }

  static calculatePortfolioHealthScore(
    holdings: Holding[], 
    userProfile?: UserProfile
  ): { score: number; recommendations: string[] } {
    if (!holdings.length) {
      return { 
        score: 0, 
        recommendations: ["Add holdings to your portfolio to get started"] 
      }
    }

    let score = 0
    const recommendations: string[] = []

    // Diversification score (0-30 points)
    const diversification = this.analyzeDiversification(holdings)
    const diversificationPoints = Math.floor(diversification.overallScore * 0.3)
    score += diversificationPoints
    recommendations.push(...diversification.recommendations)

    // Risk management score (0-25 points)
    const riskMetrics = this.calculateRiskMetrics(holdings, userProfile)

    if (userProfile) {
      const userRisk = userProfile.riskTolerance
      const portfolioRisk = riskMetrics.riskLevel.toLowerCase()
      
      if (userRisk.toLowerCase() === portfolioRisk) {
        score += 25
        recommendations.push("Portfolio risk level matches your risk tolerance")
      } else if (
        (userRisk === RiskTolerance.CONSERVATIVE && portfolioRisk === "medium") ||
        (userRisk === RiskTolerance.AGGRESSIVE && portfolioRisk === "medium")
      ) {
        score += 20
        recommendations.push("Portfolio risk level is close to your risk tolerance")
      } else {
        score += 10
        recommendations.push(`Consider adjusting portfolio risk to match your ${userRisk} risk tolerance`)
      }
    } else {
      score += 15 // Neutral score without profile
    }

    // Performance score (0-20 points)
    const performance = this.calculatePerformanceMetrics(holdings)
    if (performance.totalReturnPercent >= 10) {
      score += 20
      recommendations.push("Excellent portfolio performance")
    } else if (performance.totalReturnPercent >= 5) {
      score += 15
      recommendations.push("Good portfolio performance")
    } else if (performance.totalReturnPercent >= 0) {
      score += 10
      recommendations.push("Portfolio is performing positively")
    } else {
      score += 5
      recommendations.push("Consider reviewing underperforming holdings")
    }

    // Holdings count score (0-15 points)
    const numHoldings = holdings.length
    if (numHoldings >= 10 && numHoldings <= 30) {
      score += 15
    } else if (numHoldings >= 5 && numHoldings <= 50) {
      score += 12
    } else if (numHoldings >= 3) {
      score += 8
    } else {
      score += 3
      recommendations.push("Consider adding more holdings for better diversification")
    }

    // Concentration score (0-10 points)
    if (riskMetrics.concentrationRisk <= 20) {
      score += 10
    } else if (riskMetrics.concentrationRisk <= 30) {
      score += 7
    } else if (riskMetrics.concentrationRisk <= 50) {
      score += 4
    } else {
      score += 1
      recommendations.push("Reduce concentration in your largest holding")
    }

    // Ensure score is within bounds
    score = Math.min(Math.max(score, 0), 100)

    // Add overall assessment
    if (score >= 85) {
      recommendations.unshift("🎉 Excellent portfolio health! Keep up the great work.")
    } else if (score >= 70) {
      recommendations.unshift("👍 Good portfolio health with room for minor improvements.")
    } else if (score >= 50) {
      recommendations.unshift("⚠️ Fair portfolio health. Consider the recommendations below.")
    } else {
      recommendations.unshift("🔧 Portfolio needs attention. Focus on the key recommendations.")
    }

    return { score, recommendations }
  }

  static suggestTargetAllocation(userProfile: UserProfile): TargetAllocation {
    const age = userProfile.age
    const riskTolerance = userProfile.riskTolerance
    const timeHorizon = userProfile.timeHorizon

    // Base allocation on age (rule of thumb: 100 - age = stock percentage)
    let baseStockPercent = Math.max(100 - age, 20) // Minimum 20% stocks

    // Adjust for risk tolerance
    if (riskTolerance === RiskTolerance.CONSERVATIVE) {
      baseStockPercent = Math.max(baseStockPercent - 20, 20)
    } else if (riskTolerance === RiskTolerance.AGGRESSIVE) {
      baseStockPercent = Math.min(baseStockPercent + 20, 90)
    }

    // Adjust for time horizon
    if (timeHorizon === 'SHORT_TERM') {
      baseStockPercent = Math.max(baseStockPercent - 15, 20)
    } else if (timeHorizon === 'LONG_TERM') {
      baseStockPercent = Math.min(baseStockPercent + 10, 90)
    }

    const bondPercent = 100 - baseStockPercent

    return {
      stocks: baseStockPercent,
      bonds: bondPercent,
      cash: 5, // Small cash allocation
      alternatives: 0 // No alternatives for basic allocation
    }
  }
}
# Enhanced Web Experience & UI Design

## Executive Summary

This document outlines the enhanced web experience and UI improvements for the $200k investor segment, focusing on professional-grade interfaces, advanced data visualization, and sophisticated user workflows that match the expectations of experienced investors.

## Design Philosophy

### Core Principles
- **Professional Excellence**: Interface quality matching institutional financial tools
- **Data-First Design**: Information hierarchy prioritizing actionable insights
- **Efficiency-Focused**: Streamlined workflows for power users
- **Contextual Intelligence**: Smart defaults and adaptive interfaces
- **Trust & Security**: Visual cues reinforcing data protection and reliability

### User Experience Goals
- **Reduce cognitive load** for complex financial decisions
- **Accelerate time-to-insight** for portfolio analysis
- **Enhance decision confidence** through clear data presentation
- **Minimize clicks** for frequent actions
- **Maximize information density** without overwhelming users

## Enhanced UI Components

### 1. Advanced Dashboard Architecture

#### Executive Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ Portfolio Health Score: 87/100     Net Worth: $234,567     │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ Performance     │ │ Risk Metrics    │ │ Optimization    │ │
│ │ YTD: +12.4%     │ │ Beta: 0.95      │ │ 3 Opportunities │ │
│ │ 3Y: +9.8%       │ │ Sharpe: 1.23    │ │ Est. Savings:   │ │
│ │ vs S&P: +2.1%   │ │ Max DD: -8.2%   │ │ $2,400/year     │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
│                                                             │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │        Asset Allocation Heatmap                           │ │
│ │   [US Stocks: 45%] [Intl: 20%] [Bonds: 25%] [Cash: 10%]  │ │
│ │        Target    Current    Drift                         │ │
│ └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### Portfolio Analysis Dashboard
- **Multi-Account View**: Consolidated view across all investment accounts
- **Real-Time Updates**: Live price feeds with WebSocket connections
- **Smart Alerts**: Contextual notifications for rebalancing opportunities
- **Drill-Down Capability**: Click-through to detailed analysis

### 2. Professional-Grade Data Visualization

#### Interactive Charts
- **Performance Attribution Charts**: Contribution analysis by asset class
- **Risk-Return Scatter Plots**: Efficient frontier visualization
- **Correlation Heat Maps**: Asset correlation analysis
- **Rolling Returns**: 3-year rolling performance analysis
- **Drawdown Analysis**: Maximum drawdown visualization over time

#### Chart Features
- **Zoom and Pan**: Detailed time-series analysis
- **Overlay Capabilities**: Multiple metrics on single chart
- **Benchmarking**: Comparison against relevant indices
- **Export Options**: PNG, PDF, CSV data export
- **Annotation Tools**: Personal notes and markers

### 3. Advanced Table Components

#### Portfolio Holdings Table
```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Symbol │ Name               │ Shares  │ Price   │ Value    │ %Port │ Gain/Loss │ Actions │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ VTI    │ Total Stock Market │ 125.50  │ $234.67 │ $29,450  │ 12.6% │ +$2,340   │ [...]   │
│ VTIAX  │ Total Intl Stock   │ 89.25   │ $28.91  │ $25,804  │ 11.0% │ +$1,204   │ [...]   │
│ BND    │ Total Bond Market  │ 245.75  │ $78.45  │ $19,289  │ 8.2%  │ -$456     │ [...]   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Table Features
- **Sortable Columns**: Multi-column sorting with visual indicators
- **Filtering**: Real-time search and filter capabilities
- **Contextual Actions**: Right-click menus for portfolio actions
- **Conditional Formatting**: Color-coded performance indicators
- **Grouping**: Asset class, account, or sector grouping

### 4. Intelligent Forms and Wizards

#### Goal Setting Wizard
```
Step 1: Goal Type Selection
┌─────────────────────────────────────────────────────────────┐
│ [🏠 Home Purchase]  [🎓 Education]  [💰 Retirement]        │
│ [🚗 Major Purchase] [🏖️ Vacation]  [💼 Business]          │
│ [🎯 Custom Goal]                                           │
└─────────────────────────────────────────────────────────────┘

Step 2: Smart Parameter Detection
┌─────────────────────────────────────────────────────────────┐
│ Based on your profile (Age: 42, Income: $120k):           │
│ • Suggested retirement target: $2.4M                      │
│ • Required monthly savings: $2,847                        │
│ • Probability of success: 78%                             │
│                                                            │
│ [Adjust Parameters] [Accept Recommendation]               │
└─────────────────────────────────────────────────────────────┘
```

#### Portfolio Optimization Wizard
- **Risk Assessment**: Interactive risk tolerance questionnaire
- **Constraint Setting**: Tax implications, ESG preferences, exclusions
- **Optimization Engine**: Mean-variance optimization with constraints
- **Implementation Plan**: Step-by-step rebalancing instructions

### 5. Advanced Analytics Interfaces

#### Tax-Loss Harvesting Dashboard
```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Tax-Loss Harvesting Opportunities                    Potential Savings: $3,247          │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ Holding         │ Unrealized Loss │ Wash Sale Risk │ Replacement       │ Action         │
│ ARKK            │ -$2,450         │ None           │ VTI               │ [Harvest]      │
│ TSLA            │ -$1,890         │ Medium         │ Hold 31 days      │ [Schedule]     │
│ BONDS           │ -$567           │ Low            │ BND               │ [Harvest]      │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Rebalancing Interface
- **Drift Visualization**: Visual representation of allocation drift
- **Rebalancing Calculator**: Optimal buy/sell recommendations
- **Tax Impact Analysis**: Before/after tax implications
- **Implementation Timeline**: Suggested execution schedule

### 6. Enhanced Mobile Experience

#### Mobile Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ Portfolio: $234,567 (+2.3% today)                         │
│ ┌─────────────────┐ ┌─────────────────┐                   │
│ │ Performance     │ │ Next Action     │                   │
│ │ YTD: +12.4%     │ │ Rebalance VTI   │                   │
│ │ [Mini Chart]    │ │ Expected: +$240 │                   │
│ └─────────────────┘ └─────────────────┘                   │
│                                                            │
│ Recent Alerts:                                             │
│ • VTIAX dividend: $127.50                                  │
│ • Tax-loss opportunity: ARKK (-$2,450)                     │
│ • Rebalancing needed: 5.2% drift                          │
└─────────────────────────────────────────────────────────────┘
```

#### Mobile-Optimized Features
- **Swipe Gestures**: Portfolio navigation and actions
- **Push Notifications**: Smart alerts for time-sensitive opportunities
- **Offline Capability**: Core functionality without internet
- **Biometric Authentication**: Touch ID/Face ID integration

## Enhanced User Workflows

### 1. Professional Portfolio Analysis Workflow

#### Daily Review (2-3 minutes)
1. **Dashboard Scan**: Portfolio health score and key metrics
2. **Alert Review**: Automated recommendations and opportunities
3. **Performance Check**: Daily/weekly performance summary
4. **Action Items**: Quick wins and optimization opportunities

#### Weekly Deep Dive (15-20 minutes)
1. **Performance Attribution**: Detailed analysis of returns
2. **Risk Metrics Review**: Volatility, beta, and correlation analysis
3. **Rebalancing Assessment**: Drift analysis and recommendations
4. **Tax Optimization**: Harvesting and placement opportunities

#### Monthly Strategic Review (30-45 minutes)
1. **Goal Progress**: Tracking toward financial objectives
2. **Portfolio Optimization**: Comprehensive rebalancing analysis
3. **Tax Planning**: Year-to-date tax implications
4. **Strategic Adjustments**: Asset allocation and strategy updates

### 2. Goal Management Workflow

#### Goal Creation Process
1. **Smart Goal Detection**: AI-powered goal suggestions
2. **Parameter Optimization**: Monte Carlo analysis for success probability
3. **Implementation Planning**: Automatic savings and investment plan
4. **Progress Tracking**: Monthly milestone monitoring

#### Goal Adjustment Workflow
1. **Life Event Triggers**: Marriage, job change, inheritance
2. **Scenario Analysis**: Impact of changes on all goals
3. **Reoptimization**: Revised savings and allocation strategy
4. **Implementation**: Updated automatic investment plan

### 3. Tax Optimization Workflow

#### Year-Round Tax Management
1. **Continuous Monitoring**: Real-time tax-loss opportunities
2. **Harvesting Automation**: Automated wash sale prevention
3. **Asset Location**: Tax-efficient fund placement optimization
4. **Year-End Planning**: Q4 tax strategy implementation

## Advanced Features Integration

### 1. AI-Powered Insights

#### Intelligent Recommendations
- **Personalized Advice**: Machine learning-based suggestions
- **Market Context**: Integration of market conditions and opportunities
- **Behavioral Coaching**: Bias detection and correction
- **Predictive Analytics**: Forecasting and scenario planning

#### Natural Language Interface
- **Voice Commands**: "Show me my tax-loss harvesting opportunities"
- **Chat Interface**: Conversational financial planning assistance
- **Smart Search**: Natural language portfolio queries
- **Contextual Help**: Intelligent tooltips and explanations

### 2. Professional-Grade Security

#### Security Visual Indicators
- **Encryption Status**: Visual confirmation of data protection
- **Local Processing**: Clear indication of local-only data
- **Audit Trail**: Transaction and access logging
- **Secure Sessions**: Session timeout and activity monitoring

#### Privacy Controls
- **Data Transparency**: Clear data usage and storage policies
- **Export Options**: Full data portability and backup
- **Deletion Tools**: Comprehensive data removal options
- **Consent Management**: Granular privacy preferences

### 3. Collaboration and Sharing

#### Professional Reports
- **Automated Reporting**: Monthly, quarterly, and annual reports
- **Customizable Templates**: Professional-grade PDF generation
- **Sharing Options**: Secure report sharing with advisors
- **Version Control**: Historical report tracking

#### Advisor Integration
- **Advisor Dashboard**: Shared view for professional collaboration
- **Secure Messaging**: Encrypted communication with advisors
- **Document Sharing**: Secure file exchange
- **Permission Management**: Granular access controls

## Implementation Priorities

### Phase 1: Core Experience Enhancement (Months 1-3)
- Advanced dashboard with real-time data
- Professional-grade charts and visualizations
- Enhanced portfolio analysis tools
- Mobile optimization

### Phase 2: Advanced Features (Months 4-6)
- AI-powered recommendations
- Tax optimization workflows
- Goal management enhancement
- Professional reporting

### Phase 3: Collaboration and Integration (Months 7-9)
- Advisor collaboration features
- Advanced security implementations
- Natural language interface
- Predictive analytics

## Success Metrics

### User Experience Metrics
- **Time to Insight**: <30 seconds for key portfolio metrics
- **Task Completion Rate**: 95% for common workflows
- **User Satisfaction**: 4.5+ stars average rating
- **Feature Adoption**: 80% of users using advanced features

### Performance Metrics
- **Page Load Time**: <2 seconds for all main pages
- **Real-Time Updates**: <5 seconds for live data refresh
- **Mobile Performance**: 90+ Lighthouse score
- **Accessibility**: WCAG 2.1 AA compliance

## Component Architecture Deep Dive

### 1. Core Component Hierarchy

```typescript
// src/components/layout/AppLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { NotificationCenter } from './NotificationCenter';
import { useAuth } from '@/hooks/useAuth';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useMarketData } from '@/hooks/useMarketData';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { portfolios, isLoading } = usePortfolio();
  const { marketData, isConnected } = useMarketData();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        portfolios={portfolios}
        isLoading={isLoading}
        className="w-64 bg-white shadow-lg"
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={user}
          marketStatus={isConnected ? 'connected' : 'disconnected'}
          className="h-16 bg-white shadow-sm"
        />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
          {children}
        </main>
      </div>
      
      {/* Notification Center */}
      <NotificationCenter />
    </div>
  );
};
```

### 2. Advanced Portfolio Components

#### Portfolio Overview Component
```typescript
// src/components/portfolio/PortfolioOverview.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PerformanceChart } from './PerformanceChart';
import { AllocationChart } from './AllocationChart';
import { HoldingsTable } from './HoldingsTable';
import { OptimizationPanel } from './OptimizationPanel';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useOptimization } from '@/hooks/useOptimization';
import { useMarketData } from '@/hooks/useMarketData';

interface PortfolioOverviewProps {
  portfolioId: string;
}

export const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({ portfolioId }) => {
  const { portfolio, analytics, isLoading } = usePortfolio(portfolioId);
  const { optimizationResults, runOptimization } = useOptimization(portfolioId);
  const { subscribeToSymbols } = useMarketData();
  
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | '3Y' | '5Y'>('1M');
  const [showOptimization, setShowOptimization] = useState(false);

  useEffect(() => {
    if (portfolio?.holdings) {
      const symbols = portfolio.holdings.map(h => h.symbol);
      subscribeToSymbols(symbols);
    }
  }, [portfolio?.holdings, subscribeToSymbols]);

  if (isLoading) {
    return <PortfolioSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{portfolio?.name}</h1>
          <p className="text-gray-500 mt-1">Last updated: {new Date().toLocaleString()}</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowOptimization(!showOptimization)}
          >
            {showOptimization ? 'Hide' : 'Show'} Optimization
          </Button>
          <Button onClick={() => runOptimization('max_sharpe')}>
            Optimize Portfolio
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Value"
          value={portfolio?.totalValue || 0}
          change={analytics?.dailyChange || 0}
          format="currency"
        />
        <MetricCard
          title="Daily Return"
          value={analytics?.dailyReturn || 0}
          change={analytics?.dailyReturn || 0}
          format="percentage"
        />
        <MetricCard
          title="YTD Return"
          value={analytics?.ytdReturn || 0}
          change={analytics?.ytdReturn || 0}
          format="percentage"
        />
        <MetricCard
          title="Sharpe Ratio"
          value={analytics?.sharpeRatio || 0}
          format="number"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
            <TimeRangeSelector
              selected={selectedTimeRange}
              onSelect={setSelectedTimeRange}
            />
          </CardHeader>
          <CardContent>
            <PerformanceChart
              portfolioId={portfolioId}
              timeRange={selectedTimeRange}
              height={300}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <AllocationChart
              allocation={portfolio?.allocation || {}}
              targetAllocation={optimizationResults?.targetAllocation}
            />
          </CardContent>
        </Card>
      </div>

      {/* Optimization Panel */}
      {showOptimization && (
        <OptimizationPanel
          portfolioId={portfolioId}
          currentAllocation={portfolio?.allocation || {}}
          results={optimizationResults}
          onOptimize={runOptimization}
        />
      )}

      {/* Holdings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <HoldingsTable
            holdings={portfolio?.holdings || []}
            onEdit={(holdingId) => {/* Handle edit */}}
            onDelete={(holdingId) => {/* Handle delete */}}
          />
        </CardContent>
      </Card>
    </div>
  );
};
```

#### Real-Time Market Data Component
```typescript
// src/components/market-data/RealTimeQuotes.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMarketData } from '@/hooks/useMarketData';
import { formatCurrency, formatPercentage } from '@/utils/formatters';

interface RealTimeQuotesProps {
  symbols: string[];
  refreshInterval?: number;
}

export const RealTimeQuotes: React.FC<RealTimeQuotesProps> = ({ 
  symbols, 
  refreshInterval = 1000 
}) => {
  const { marketData, isConnected, subscribeToSymbols, unsubscribeFromSymbols } = useMarketData();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    subscribeToSymbols(symbols);
    return () => unsubscribeFromSymbols(symbols);
  }, [symbols, subscribeToSymbols, unsubscribeFromSymbols]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getQuoteData = (symbol: string) => {
    return marketData[symbol] || null;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeBadgeVariant = (change: number) => {
    if (change > 0) return 'success';
    if (change < 0) return 'destructive';
    return 'secondary';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Real-Time Quotes</CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant={isConnected ? 'success' : 'destructive'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
          <span className="text-sm text-gray-500">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {symbols.map(symbol => {
            const quote = getQuoteData(symbol);
            if (!quote) {
              return (
                <div key={symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <div className="animate-pulse bg-gray-300 rounded w-12 h-4"></div>
                    <div className="animate-pulse bg-gray-300 rounded w-20 h-4"></div>
                  </div>
                  <div className="animate-pulse bg-gray-300 rounded w-16 h-4"></div>
                </div>
              );
            }

            return (
              <div key={symbol} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-gray-900">{symbol}</span>
                  <span className="text-gray-500">{quote.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(quote.price)}
                    </div>
                    <div className={`text-sm ${getChangeColor(quote.change)}`}>
                      {formatCurrency(quote.change)} ({formatPercentage(quote.changePercent)})
                    </div>
                  </div>
                  <Badge variant={getChangeBadgeVariant(quote.change)}>
                    {quote.change > 0 ? '↑' : quote.change < 0 ? '↓' : '→'}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
```

### 3. State Management Architecture

#### Global State Store (Zustand)
```typescript
// src/stores/portfolioStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Portfolio, Holding, OptimizationResult } from '@/types/portfolio';

interface PortfolioState {
  portfolios: Portfolio[];
  activePortfolioId: string | null;
  optimizationResults: Record<string, OptimizationResult>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setPortfolios: (portfolios: Portfolio[]) => void;
  addPortfolio: (portfolio: Portfolio) => void;
  updatePortfolio: (id: string, updates: Partial<Portfolio>) => void;
  deletePortfolio: (id: string) => void;
  setActivePortfolio: (id: string) => void;
  updateHolding: (portfolioId: string, holdingId: string, updates: Partial<Holding>) => void;
  setOptimizationResult: (portfolioId: string, result: OptimizationResult) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePortfolioStore = create<PortfolioState>()(
  devtools(
    persist(
      immer((set, get) => ({
        portfolios: [],
        activePortfolioId: null,
        optimizationResults: {},
        isLoading: false,
        error: null,

        setPortfolios: (portfolios) => set({ portfolios }),

        addPortfolio: (portfolio) => set((state) => {
          state.portfolios.push(portfolio);
        }),

        updatePortfolio: (id, updates) => set((state) => {
          const index = state.portfolios.findIndex(p => p.id === id);
          if (index !== -1) {
            Object.assign(state.portfolios[index], updates);
          }
        }),

        deletePortfolio: (id) => set((state) => {
          state.portfolios = state.portfolios.filter(p => p.id !== id);
          if (state.activePortfolioId === id) {
            state.activePortfolioId = null;
          }
        }),

        setActivePortfolio: (id) => set({ activePortfolioId: id }),

        updateHolding: (portfolioId, holdingId, updates) => set((state) => {
          const portfolio = state.portfolios.find(p => p.id === portfolioId);
          if (portfolio) {
            const holding = portfolio.holdings.find(h => h.id === holdingId);
            if (holding) {
              Object.assign(holding, updates);
            }
          }
        }),

        setOptimizationResult: (portfolioId, result) => set((state) => {
          state.optimizationResults[portfolioId] = result;
        }),

        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
      })),
      {
        name: 'portfolio-store',
        partialize: (state) => ({
          portfolios: state.portfolios,
          activePortfolioId: state.activePortfolioId,
        }),
      }
    ),
    { name: 'portfolio-store' }
  )
);
```

#### Market Data Store
```typescript
// src/stores/marketDataStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { MarketDataPoint } from '@/types/market-data';

interface MarketDataState {
  marketData: Record<string, MarketDataPoint>;
  subscriptions: Set<string>;
  isConnected: boolean;
  connectionId: string | null;
  lastUpdate: Date | null;
  
  // Actions
  updateMarketData: (symbol: string, data: MarketDataPoint) => void;
  addSubscription: (symbol: string) => void;
  removeSubscription: (symbol: string) => void;
  setConnected: (connected: boolean) => void;
  setConnectionId: (id: string | null) => void;
  clearMarketData: () => void;
}

export const useMarketDataStore = create<MarketDataState>()(
  devtools(
    (set, get) => ({
      marketData: {},
      subscriptions: new Set(),
      isConnected: false,
      connectionId: null,
      lastUpdate: null,

      updateMarketData: (symbol, data) => set((state) => ({
        marketData: {
          ...state.marketData,
          [symbol]: data
        },
        lastUpdate: new Date()
      })),

      addSubscription: (symbol) => set((state) => ({
        subscriptions: new Set([...state.subscriptions, symbol])
      })),

      removeSubscription: (symbol) => set((state) => {
        const newSubscriptions = new Set(state.subscriptions);
        newSubscriptions.delete(symbol);
        return { subscriptions: newSubscriptions };
      }),

      setConnected: (connected) => set({ isConnected: connected }),
      setConnectionId: (id) => set({ connectionId: id }),
      
      clearMarketData: () => set({
        marketData: {},
        subscriptions: new Set(),
        isConnected: false,
        connectionId: null,
        lastUpdate: null
      }),
    }),
    { name: 'market-data-store' }
  )
);
```

### 4. Custom Hooks for Business Logic

#### Portfolio Management Hook
```typescript
// src/hooks/usePortfolio.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { portfolioApi } from '@/services/api/portfolio';
import { Portfolio, CreatePortfolioRequest } from '@/types/portfolio';
import { useCallback, useMemo } from 'react';

export const usePortfolio = (portfolioId?: string) => {
  const queryClient = useQueryClient();
  const { portfolios, setPortfolios, setLoading, setError } = usePortfolioStore();

  // Fetch all portfolios
  const { data: portfoliosData, isLoading: isLoadingPortfolios } = useQuery({
    queryKey: ['portfolios'],
    queryFn: portfolioApi.getAll,
    onSuccess: (data) => {
      setPortfolios(data);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  // Fetch specific portfolio
  const { data: portfolio, isLoading: isLoadingPortfolio } = useQuery({
    queryKey: ['portfolio', portfolioId],
    queryFn: () => portfolioApi.getById(portfolioId!),
    enabled: !!portfolioId,
  });

  // Create portfolio mutation
  const createPortfolioMutation = useMutation({
    mutationFn: (request: CreatePortfolioRequest) => portfolioApi.create(request),
    onSuccess: (newPortfolio) => {
      queryClient.setQueryData(['portfolios'], (old: Portfolio[] | undefined) => [
        ...(old || []),
        newPortfolio
      ]);
      queryClient.invalidateQueries(['portfolios']);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  // Update portfolio mutation
  const updatePortfolioMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Portfolio> }) =>
      portfolioApi.update(id, updates),
    onSuccess: (updatedPortfolio) => {
      queryClient.setQueryData(['portfolio', updatedPortfolio.id], updatedPortfolio);
      queryClient.invalidateQueries(['portfolios']);
    },
  });

  // Delete portfolio mutation
  const deletePortfolioMutation = useMutation({
    mutationFn: (id: string) => portfolioApi.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['portfolios'], (old: Portfolio[] | undefined) =>
        old?.filter(p => p.id !== deletedId) || []
      );
      queryClient.invalidateQueries(['portfolios']);
    },
  });

  // Memoized selectors
  const activePortfolio = useMemo(() => {
    return portfolioId ? portfolios.find(p => p.id === portfolioId) : null;
  }, [portfolios, portfolioId]);

  const totalValue = useMemo(() => {
    return portfolios.reduce((sum, portfolio) => sum + portfolio.totalValue, 0);
  }, [portfolios]);

  // Actions
  const createPortfolio = useCallback((request: CreatePortfolioRequest) => {
    setLoading(true);
    return createPortfolioMutation.mutateAsync(request);
  }, [createPortfolioMutation, setLoading]);

  const updatePortfolio = useCallback((id: string, updates: Partial<Portfolio>) => {
    return updatePortfolioMutation.mutateAsync({ id, updates });
  }, [updatePortfolioMutation]);

  const deletePortfolio = useCallback((id: string) => {
    return deletePortfolioMutation.mutateAsync(id);
  }, [deletePortfolioMutation]);

  return {
    // Data
    portfolios,
    portfolio: portfolioId ? (portfolio || activePortfolio) : null,
    totalValue,
    
    // Loading states
    isLoading: isLoadingPortfolios || isLoadingPortfolio,
    
    // Actions
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    
    // Mutations
    isCreating: createPortfolioMutation.isLoading,
    isUpdating: updatePortfolioMutation.isLoading,
    isDeleting: deletePortfolioMutation.isLoading,
  };
};
```

#### Real-Time Market Data Hook
```typescript
// src/hooks/useMarketData.ts
import { useEffect, useCallback, useRef } from 'react';
import { useMarketDataStore } from '@/stores/marketDataStore';
import { MarketDataPoint } from '@/types/market-data';

export const useMarketData = () => {
  const {
    marketData,
    subscriptions,
    isConnected,
    connectionId,
    updateMarketData,
    addSubscription,
    removeSubscription,
    setConnected,
    setConnectionId,
    clearMarketData
  } = useMarketDataStore();

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found');
      return;
    }

    const ws = new WebSocket(`ws://localhost:8000/ws/market-data?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Market data WebSocket connected');
      setConnected(true);
      setConnectionId(Math.random().toString(36).substr(2, 9));
      
      // Start heartbeat
      heartbeatIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'price_update':
            updateMarketData(data.symbol, data.data);
            break;
          case 'pong':
            // Heartbeat response
            break;
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('Market data WebSocket disconnected');
      setConnected(false);
      setConnectionId(null);
      
      // Clean up intervals
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      
      // Attempt to reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 5000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };
  }, [setConnected, setConnectionId, updateMarketData]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    
    clearMarketData();
  }, [clearMarketData]);

  const subscribeToSymbols = useCallback((symbols: string[]) => {
    symbols.forEach(symbol => {
      if (!subscriptions.has(symbol)) {
        addSubscription(symbol);
      }
    });

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe',
        symbols: symbols,
        data_types: ['price', 'quote']
      }));
    }
  }, [subscriptions, addSubscription]);

  const unsubscribeFromSymbols = useCallback((symbols: string[]) => {
    symbols.forEach(symbol => {
      removeSubscription(symbol);
    });

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'unsubscribe',
        symbols: symbols
      }));
    }
  }, [removeSubscription]);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    marketData,
    subscriptions: Array.from(subscriptions),
    isConnected,
    connectionId,
    subscribeToSymbols,
    unsubscribeFromSymbols,
    connect,
    disconnect,
  };
};
```

### 5. Performance Optimization Components

#### Virtual Scrolling for Large Holdings Tables
```typescript
// src/components/ui/VirtualizedTable.tsx
import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface VirtualizedTableProps<T> {
  data: T[];
  columns: Array<{
    key: string;
    title: string;
    render: (item: T, index: number) => React.ReactNode;
    width?: number;
  }>;
  height: number;
  itemHeight?: number;
  className?: string;
}

export function VirtualizedTable<T extends { id: string }>({
  data,
  columns,
  height,
  itemHeight = 50,
  className
}: VirtualizedTableProps<T>) {
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = data[index];
    
    return (
      <div style={style}>
        <TableRow className="hover:bg-gray-50">
          {columns.map((column) => (
            <TableCell key={column.key} style={{ width: column.width }}>
              {column.render(item, index)}
            </TableCell>
          ))}
        </TableRow>
      </div>
    );
  }, [data, columns]);

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} style={{ width: column.width }}>
                {column.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
      </Table>
      <List
        height={height}
        itemCount={data.length}
        itemSize={itemHeight}
        itemData={data}
      >
        {Row}
      </List>
    </div>
  );
}
```

#### Lazy Loading Chart Component
```typescript
// src/components/charts/LazyChart.tsx
import React, { lazy, Suspense } from 'react';
import { ChartSkeleton } from '@/components/ui/skeletons';

const Chart = lazy(() => import('./Chart'));

interface LazyChartProps {
  type: 'line' | 'bar' | 'pie' | 'area';
  data: any[];
  config: any;
  height?: number;
}

export const LazyChart: React.FC<LazyChartProps> = (props) => {
  return (
    <Suspense fallback={<ChartSkeleton height={props.height} />}>
      <Chart {...props} />
    </Suspense>
  );
};
```

## Mobile-First Responsive Design

### Responsive Layout System
```typescript
// src/components/layout/ResponsiveLayout.tsx
import React from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { MobileLayout } from './MobileLayout';
import { DesktopLayout } from './DesktopLayout';

export const ResponsiveLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  if (isMobile) {
    return <MobileLayout>{children}</MobileLayout>;
  }

  if (isTablet) {
    return <TabletLayout>{children}</TabletLayout>;
  }

  return <DesktopLayout>{children}</DesktopLayout>;
};
```

### Mobile Portfolio Dashboard
```typescript
// src/components/mobile/MobilePortfolioDashboard.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SwipeableDrawer } from '@/components/ui/swipeable-drawer';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useSwipeable } from 'react-swipeable';

interface MobilePortfolioDashboardProps {
  portfolioId: string;
}

export const MobilePortfolioDashboard: React.FC<MobilePortfolioDashboardProps> = ({ portfolioId }) => {
  const { portfolio, analytics } = usePortfolio(portfolioId);
  const [activeTab, setActiveTab] = useState('overview');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      const tabs = ['overview', 'holdings', 'performance', 'optimization'];
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1]);
      }
    },
    onSwipedRight: () => {
      const tabs = ['overview', 'holdings', 'performance', 'optimization'];
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex > 0) {
        setActiveTab(tabs[currentIndex - 1]);
      }
    },
    onSwipedUp: () => setDrawerOpen(true),
  });

  return (
    <div className="h-full flex flex-col" {...swipeHandlers}>
      {/* Mobile Header */}
      <div className="bg-white shadow-sm p-4">
        <h1 className="text-xl font-semibold truncate">{portfolio?.name}</h1>
        <div className="flex justify-between items-center mt-2">
          <span className="text-2xl font-bold">
            {formatCurrency(portfolio?.totalValue || 0)}
          </span>
          <span className={`text-sm font-medium ${
            (analytics?.dailyChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatPercentage(analytics?.dailyReturn || 0)}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="optimization">Optimize</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="overview" className="space-y-4">
            <MobileOverviewTab portfolio={portfolio} analytics={analytics} />
          </TabsContent>
          
          <TabsContent value="holdings" className="space-y-4">
            <MobileHoldingsTab holdings={portfolio?.holdings || []} />
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-4">
            <MobilePerformanceTab portfolioId={portfolioId} />
          </TabsContent>
          
          <TabsContent value="optimization" className="space-y-4">
            <MobileOptimizationTab portfolioId={portfolioId} />
          </TabsContent>
        </div>
      </Tabs>

      {/* Quick Actions Drawer */}
      <SwipeableDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
      >
        <div className="p-4 space-y-4">
          <Button className="w-full" onClick={() => {/* Add holding */}}>
            Add Holding
          </Button>
          <Button className="w-full" variant="outline" onClick={() => {/* Rebalance */}}>
            Rebalance Portfolio
          </Button>
          <Button className="w-full" variant="outline" onClick={() => {/* Export */}}>
            Export Data
          </Button>
        </div>
      </SwipeableDrawer>
    </div>
  );
};
```

This enhanced web experience transforms the application from a basic financial tool into a professional-grade platform that sophisticated investors can rely on for complex financial decision-making. The component architecture provides modularity, performance optimization, and responsive design that works seamlessly across all device types.
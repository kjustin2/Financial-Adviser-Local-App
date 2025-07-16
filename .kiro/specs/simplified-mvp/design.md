# Design Document

## Overview

This design outlines a simplified MVP version of the financial advisor application that focuses on core functionality while removing complex features, extensive testing infrastructure, and unnecessary components. The goal is to create a clean, functional first version with just the essential features: basic user profile, simple financial health assessment, basic goal setting, and fundamental recommendations.

## Architecture

### Simplified Application Structure

The MVP will use a streamlined architecture:

- **Frontend**: React 18 with TypeScript, Vite for building
- **Styling**: Tailwind CSS with minimal custom components
- **State Management**: Simplified Zustand stores (only 3 core stores)
- **Storage**: IndexedDB via Dexie for local data persistence
- **Routing**: React Router with simplified navigation
- **Testing**: Basic unit tests only (remove Playwright E2E testing)

### Removed Components

The following will be removed or simplified:
- Complex portfolio management features
- Advanced analytics and calculations
- Extensive testing infrastructure (Playwright, accessibility tests)
- Complex recommendation engine
- Advanced error handling and loading states
- Multiple onboarding steps
- Complex navigation and layout components

## Components and Interfaces

### Core Pages (Simplified)

1. **Simple Onboarding** (`/onboarding`)
   - Single-step form for basic profile setup
   - Name, age, income range, basic financial situation
   - No complex wizard or multi-step process

2. **Dashboard** (`/`)
   - Financial health summary (3-4 key metrics)
   - Active goals overview (max 3 goals)
   - Top 3 basic recommendations
   - Simple, clean layout with minimal cards

3. **Profile** (`/profile`)
   - Basic profile editing
   - Simple financial health inputs (savings, expenses, debt)
   - Risk tolerance assessment (simplified)

4. **Goals** (`/goals`)
   - Add/edit basic financial goals
   - Simple goal types: Emergency Fund, Retirement, Major Purchase
   - Basic progress tracking

### Simplified Components

1. **Common Components**
   - `Button`, `Card`, `Input`, `Select` (basic versions only)
   - Remove complex components like `LoadingSpinner`, `ErrorBoundary`, `NavigationGuard`

2. **Layout**
   - Simple header with basic navigation
   - Remove complex sidebar, breadcrumbs, and advanced navigation

3. **Forms**
   - Basic form components with minimal validation
   - Remove complex form wizards and multi-step processes

## Data Models

### Simplified User Profile

```typescript
interface SimpleUserProfile {
  id: string
  name: string
  age: number
  monthlyIncome: number
  monthlySavings: number
  monthlyExpenses: number
  currentDebt: number
  emergencyFund: number
  riskTolerance: 'low' | 'medium' | 'high'
  createdAt: Date
  updatedAt: Date
}
```

### Basic Financial Goal

```typescript
interface SimpleGoal {
  id: string
  userId: string
  type: 'emergency' | 'retirement' | 'purchase'
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: Date
  monthlyContribution: number
  createdAt: Date
}
```

### Basic Recommendation

```typescript
interface SimpleRecommendation {
  id: string
  userId: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: 'savings' | 'debt' | 'goals' | 'risk'
  actionText: string
  createdAt: Date
}
```

## Error Handling

### Simplified Error Handling

- Basic try-catch blocks for critical operations
- Simple error messages (no complex error boundary system)
- Local storage fallbacks for data persistence issues
- Basic form validation with inline error messages

## Testing Strategy

### Minimal Testing Approach

1. **Unit Tests Only**
   - Test core business logic functions
   - Test data validation and calculations
   - Remove all E2E testing infrastructure

2. **Remove Testing Infrastructure**
   - Remove Playwright configuration and tests
   - Remove accessibility testing
   - Remove complex test utilities and mocks
   - Keep only basic Vitest setup for unit tests

3. **Manual Testing**
   - Focus on manual testing for UI interactions
   - Simple smoke testing for core user flows

## Implementation Approach

### File Structure Simplification

```
web/src/
├── components/
│   ├── common/           # Only Button, Card, Input, Select
│   └── layout/           # Simple Header only
├── pages/                # Dashboard, Profile, Goals, Onboarding
├── services/             # database.ts only
├── stores/               # 3 stores: profile, goals, recommendations
├── types/                # Simplified type definitions
├── utils/                # Basic calculations and formatters only
└── App.tsx               # Simplified routing
```

### Removed Files and Directories

- `web/e2e/` - Remove entire E2E testing directory
- `web/playwright.config.ts` - Remove Playwright configuration
- Complex component directories (`analysis/`, `portfolio/`, `onboarding/wizard/`)
- Advanced services (`analytics.ts`, `recommendations.ts` complex logic)
- Complex stores and state management
- Advanced utilities and helpers

### Package.json Cleanup

Remove dependencies:
- `@playwright/test`
- `@axe-core/playwright`
- Complex testing utilities
- Unused UI libraries

Keep essential dependencies:
- React, React Router, TypeScript
- Tailwind CSS, Lucide React icons
- Zustand, Dexie, Zod
- Basic Vitest for unit testing

## User Experience Flow

### Simplified User Journey

1. **First Visit**
   - Land on simple onboarding form
   - Fill basic profile information (5-6 fields)
   - Immediately redirect to dashboard

2. **Dashboard Experience**
   - See financial health score
   - View 2-3 active goals
   - See 3 basic recommendations
   - Quick access to profile and goals

3. **Goal Management**
   - Add goals with simple form
   - Track progress with basic progress bars
   - Edit/delete goals easily

4. **Profile Management**
   - Update basic financial information
   - Adjust risk tolerance
   - See how changes affect recommendations

## Technical Decisions

### Simplified State Management

- Use 3 Zustand stores maximum
- Remove complex state synchronization
- Basic local storage persistence
- No complex state derivations or computed values

### Basic Recommendation Engine

- Simple rule-based recommendations
- No complex financial calculations
- 5-10 predefined recommendation templates
- Basic personalization based on profile data

### Minimal Styling System

- Use Tailwind utility classes directly
- Remove complex component variants
- Basic responsive design
- Simple color scheme and typography

### Development Workflow

- Remove complex build processes
- Simplify development scripts
- Remove testing automation
- Focus on fast development iteration
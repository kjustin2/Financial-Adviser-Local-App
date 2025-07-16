# Project Structure & Organization

## Repository Layout

```
├── web/                    # Main React application
├── .github/workflows/      # CI/CD automation
├── scripts/               # Build and validation scripts
└── images/                # Documentation assets
```

## Web Application Structure

```
web/src/
├── components/            # Reusable UI components
│   ├── common/           # Generic components (Button, Modal, etc.)
│   ├── layout/           # Layout and navigation components
│   ├── portfolio/        # Portfolio-specific components
│   ├── goals/            # Goal management components
│   ├── profile/          # User profile and risk assessment
│   └── analysis/         # Analytics and recommendations
├── pages/                # Main application pages
│   ├── Dashboard.tsx     # Portfolio overview
│   ├── Portfolio.tsx     # Holdings management
│   ├── Goals.tsx         # Financial goals tracking
│   ├── Profile.tsx       # User profile setup
│   └── Analysis.tsx      # Analytics and recommendations
├── services/             # Business logic and data services
│   ├── database.ts       # IndexedDB operations
│   ├── analytics.ts      # Portfolio calculations
│   ├── recommendations.ts # Investment advice logic
│   └── storage.ts        # Data persistence
├── stores/               # Zustand state management
│   ├── portfolioStore.ts # Portfolio state
│   ├── goalsStore.ts     # Goals state
│   ├── profileStore.ts   # User profile state
│   └── recommendationsStore.ts # Recommendations state
├── types/                # TypeScript definitions
│   ├── portfolio.ts      # Portfolio and holdings types
│   ├── goals.ts          # Financial goals types
│   ├── profile.ts        # User profile types
│   └── recommendations.ts # Recommendation types
├── utils/                # Helper functions
│   ├── calculations.ts   # Financial calculations
│   ├── formatters.ts     # Data formatting utilities
│   ├── validation.ts     # Input validation
│   └── cn.ts            # Tailwind class utilities
└── test/                 # Test files and setup
```

## Naming Conventions

- **Components**: PascalCase (e.g., `PortfolioSummary.tsx`)
- **Files**: camelCase for utilities, PascalCase for components
- **Stores**: camelCase with "Store" suffix (e.g., `portfolioStore.ts`)
- **Types**: PascalCase interfaces and types
- **Constants**: UPPER_SNAKE_CASE

## Component Organization

- **Feature-based grouping**: Components organized by domain (portfolio, goals, profile)
- **Common components**: Reusable UI elements in `components/common/`
- **Page components**: Top-level route components in `pages/`
- **Layout components**: Navigation and structural elements in `components/layout/`
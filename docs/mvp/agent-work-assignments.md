# Agent Work Assignments

Quick reference for which agent should work on which files and tasks.

## Stream Ownership Map

### Backend Agents

#### Stream 1: Core Backend Infrastructure
**Files to Create/Own:**
```
backend/
├── app/
│   ├── __init__.py
│   ├── database.py            ← Database connection setup
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py            ← Base model class
│   │   ├── user.py            ← User authentication model
│   │   ├── client.py          ← Client model
│   │   ├── portfolio.py       ← Portfolio model
│   │   ├── holding.py         ← Holdings model
│   │   ├── transaction.py     ← Transaction model
│   │   └── goal.py            ← Financial goals model
│   └── security/
│       ├── __init__.py
│       ├── auth.py            ← Authentication utilities
│       └── encryption.py      ← Encryption helpers
├── alembic.ini                ← Alembic configuration
└── alembic/
    └── versions/              ← Migration files
```

#### Stream 2: API Development
**Files to Create/Own:**
```
backend/
└── app/
    ├── main.py                ← FastAPI app entry
    ├── config.py              ← Configuration management
    ├── schemas/
    │   ├── __init__.py
    │   ├── auth.py            ← Auth request/response
    │   ├── client.py          ← Client schemas
    │   ├── portfolio.py       ← Portfolio schemas
    │   ├── holding.py         ← Holding schemas
    │   ├── goal.py            ← Goal schemas
    │   └── common.py          ← Shared schemas
    └── api/
        ├── __init__.py
        ├── deps.py            ← Dependencies
        └── v1/
            ├── __init__.py
            ├── api.py         ← Router setup
            └── endpoints/
                ├── __init__.py
                ├── auth.py
                ├── clients.py
                ├── portfolios.py
                ├── holdings.py
                ├── goals.py
                └── reports.py
```

#### Stream 6: Financial Engine
**Files to Create/Own:**
```
backend/
└── app/
    ├── services/
    │   ├── __init__.py
    │   ├── market_data_service.py    ← Market data APIs
    │   ├── portfolio_service.py      ← Portfolio calculations
    │   ├── goal_service.py           ← Goal tracking
    │   ├── calculation_engine.py     ← Financial math
    │   └── report_service.py         ← Report generation
    └── utils/
        ├── __init__.py
        ├── financial.py               ← Financial utilities
        ├── validators.py              ← Custom validators
        └── formatters.py              ← Data formatting
```

### Frontend Agents

#### Stream 3: Frontend Foundation
**Files to Create/Own:**
```
frontend/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.tsx                      ← Entry point
│   ├── App.tsx                       ← Main app component
│   ├── vite-env.d.ts
│   ├── styles/
│   │   ├── globals.css               ← Global styles
│   │   └── tailwind.css              ← Tailwind imports
│   └── components/
│       ├── ui/                       ← shadcn/ui components
│       │   ├── button.tsx
│       │   ├── card.tsx
│       │   ├── input.tsx
│       │   ├── table.tsx
│       │   └── dialog.tsx
│       ├── layout/
│       │   ├── Header.tsx
│       │   ├── Sidebar.tsx
│       │   ├── Navigation.tsx
│       │   └── Layout.tsx
│       └── common/
│           ├── LoadingSpinner.tsx
│           ├── ErrorBoundary.tsx
│           └── SearchBar.tsx
```

#### Stream 4: Frontend Features
**Files to Create/Own:**
```
frontend/
└── src/
    ├── pages/
    │   ├── Dashboard.tsx
    │   ├── clients/
    │   │   ├── ClientList.tsx
    │   │   ├── ClientDetail.tsx
    │   │   └── ClientEdit.tsx
    │   ├── portfolios/
    │   │   ├── PortfolioList.tsx
    │   │   ├── PortfolioDetail.tsx
    │   │   └── PortfolioAnalysis.tsx
    │   ├── goals/
    │   │   ├── GoalList.tsx
    │   │   └── GoalDetail.tsx
    │   └── settings/
    │       └── Settings.tsx
    ├── services/
    │   ├── api.ts                    ← Base API config
    │   ├── auth.ts                   ← Auth API calls
    │   ├── clients.ts                ← Client API
    │   ├── portfolios.ts             ← Portfolio API
    │   └── goals.ts                  ← Goals API
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── useApi.ts
    │   └── useLocalStorage.ts
    └── store/
        ├── index.ts
        ├── authSlice.ts
        └── uiSlice.ts
```

### Integration & Testing

#### Stream 5: Integration & Contracts
**Files to Create/Own:**
```
├── api-contracts.md                  ← API documentation
├── frontend/
│   └── src/
│       ├── types/                    ← TypeScript types
│       │   ├── api.ts
│       │   ├── client.ts
│       │   ├── portfolio.ts
│       │   └── common.ts
│       └── mocks/                    ← Mock data
│           ├── handlers.ts
│           ├── browser.ts
│           └── data/
└── tests/
    ├── conftest.py
    ├── integration/
    │   ├── test_auth_flow.py
    │   ├── test_portfolio_workflow.py
    │   └── test_api_contracts.py
    └── e2e/
        ├── auth.spec.ts
        └── portfolio.spec.ts
```

### DevOps

#### Stream 7: Infrastructure & DevOps
**Files to Create/Own:**
```
├── docker-compose.yml
├── Dockerfile
├── .dockerignore
├── .github/
│   └── workflows/
│       ├── test.yml
│       ├── build.yml
│       └── release.yml
├── scripts/
│   ├── dev-setup.sh
│   ├── build-standalone.py
│   ├── build-installers.py
│   └── test-all.sh
└── .env.example
```

## Coordination Rules

### Before Creating Files
1. Check if another stream owns the directory
2. Coordinate on shared interfaces
3. Follow naming conventions

### Shared Files (Require Coordination)
- `README.md` - All streams contribute
- `CLAUDE.md` - Update after major changes
- `package.json` (root) - Stream 7 manages
- `.gitignore` - Stream 7 manages

### API Contract Process
1. Stream 2 proposes endpoint design
2. Stream 5 reviews and documents
3. Stream 4 implements frontend
4. Stream 5 writes integration tests

### Database Schema Process
1. Stream 1 proposes model changes
2. Stream 2 reviews for API impact
3. Stream 6 reviews for calculations
4. Stream 1 creates migration

## Daily Checklist

### For All Agents
- [ ] Check dependencies from other streams
- [ ] Update progress in your stream's README
- [ ] Commit with descriptive messages
- [ ] Run tests before pushing
- [ ] Document any API changes

### Stream-Specific
- **Backend Agents**: Run `poetry run pytest` before commit
- **Frontend Agents**: Run `npm run lint` and `npm run type-check`
- **Integration Agent**: Update `api-contracts.md` for any changes
- **DevOps Agent**: Ensure CI/CD passes for all PRs

## Getting Started Commands

### Backend Streams (1, 2, 6)
```bash
cd backend
poetry install
poetry shell
# Create your feature branch
git checkout -b feature/stream-X-description
```

### Frontend Streams (3, 4)
```bash
cd frontend
npm install
# Create your feature branch
git checkout -b feature/stream-X-description
```

### Integration Stream (5)
```bash
# Work from root directory
# Create feature branch
git checkout -b feature/stream-5-description
```

### DevOps Stream (7)
```bash
# Work from root directory
# Install dev tools
pip install pre-commit
pre-commit install
# Create feature branch
git checkout -b feature/stream-7-description
```

Remember: Communication is key! Check the coordination points in `parallel-development-plan.md` daily.
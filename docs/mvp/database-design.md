# Database Design

## Overview
This document outlines the database schema design for the financial adviser application, based on the features defined in our roadmap.

## Database Technology Choice
**Primary Database:** SQLite (local development) → PostgreSQL (SaaS migration)
**ORM:** SQLAlchemy 2.0+ with Alembic for migrations

## Core Entity Design

### 1. Users/Advisors Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    firm_name VARCHAR(255),
    license_number VARCHAR(50),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Clients Table
```sql
CREATE TABLE clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',
    risk_tolerance ENUM('conservative', 'moderate', 'aggressive') DEFAULT 'moderate',
    annual_income DECIMAL(15,2),
    net_worth DECIMAL(15,2),
    employment_status VARCHAR(50),
    retirement_age INTEGER,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 3. Portfolios Table
```sql
CREATE TABLE portfolios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    portfolio_type ENUM('investment', 'retirement', 'education', 'taxable', 'tax_deferred') DEFAULT 'investment',
    target_allocation JSON, -- {"stocks": 60, "bonds": 30, "cash": 10}
    risk_level ENUM('conservative', 'moderate', 'aggressive') DEFAULT 'moderate',
    benchmark_symbol VARCHAR(10), -- S&P 500 = "SPY"
    rebalance_frequency ENUM('monthly', 'quarterly', 'semiannual', 'annual') DEFAULT 'quarterly',
    rebalance_threshold DECIMAL(5,2) DEFAULT 5.00, -- 5% deviation threshold
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);
```

### 4. Holdings Table
```sql
CREATE TABLE holdings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    portfolio_id INTEGER NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    security_name VARCHAR(255),
    security_type ENUM('stock', 'bond', 'etf', 'mutual_fund', 'cash', 'crypto', 'other') NOT NULL,
    quantity DECIMAL(15,6) NOT NULL,
    cost_basis DECIMAL(15,4) NOT NULL, -- Per share/unit cost basis
    purchase_date DATE NOT NULL,
    current_price DECIMAL(15,4),
    last_price_update TIMESTAMP,
    sector VARCHAR(100),
    asset_class ENUM('equity', 'fixed_income', 'cash', 'alternative', 'commodity'),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
    UNIQUE(portfolio_id, symbol, purchase_date) -- Prevent duplicate holdings
);
```

### 5. Transactions Table
```sql
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    portfolio_id INTEGER NOT NULL,
    holding_id INTEGER,
    transaction_type ENUM('buy', 'sell', 'dividend', 'interest', 'fee', 'deposit', 'withdrawal') NOT NULL,
    symbol VARCHAR(20),
    quantity DECIMAL(15,6),
    price DECIMAL(15,4),
    total_amount DECIMAL(15,2) NOT NULL,
    fee DECIMAL(10,2) DEFAULT 0,
    transaction_date DATE NOT NULL,
    settlement_date DATE,
    description TEXT,
    tax_lot_method ENUM('fifo', 'lifo', 'specific_id', 'average_cost') DEFAULT 'fifo',
    is_tax_exempt BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
    FOREIGN KEY (holding_id) REFERENCES holdings(id) ON DELETE SET NULL
);
```

### 6. Financial Goals Table
```sql
CREATE TABLE financial_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    goal_type ENUM('retirement', 'education', 'emergency_fund', 'major_purchase', 'vacation', 'debt_payoff', 'other') NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0,
    target_date DATE,
    priority_level INTEGER DEFAULT 3, -- 1=highest, 5=lowest
    monthly_contribution DECIMAL(10,2),
    expected_return_rate DECIMAL(5,4) DEFAULT 0.07, -- 7% default
    inflation_rate DECIMAL(5,4) DEFAULT 0.03, -- 3% default
    is_achieved BOOLEAN DEFAULT FALSE,
    achievement_date DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);
```

### 7. Goal Contributions Table
```sql
CREATE TABLE goal_contributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    goal_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    contribution_date DATE NOT NULL,
    contribution_type ENUM('manual', 'automatic', 'bonus', 'gift') DEFAULT 'manual',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (goal_id) REFERENCES financial_goals(id) ON DELETE CASCADE
);
```

### 8. Market Data Cache Table
```sql
CREATE TABLE market_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol VARCHAR(20) NOT NULL,
    price DECIMAL(15,4) NOT NULL,
    change_amount DECIMAL(15,4),
    change_percent DECIMAL(8,4),
    volume BIGINT,
    market_cap BIGINT,
    pe_ratio DECIMAL(8,2),
    dividend_yield DECIMAL(5,4),
    beta DECIMAL(6,4),
    fifty_two_week_high DECIMAL(15,4),
    fifty_two_week_low DECIMAL(15,4),
    data_date DATE NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (symbol, data_date)
);
```

### 9. Reports Table
```sql
CREATE TABLE reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    client_id INTEGER,
    portfolio_id INTEGER,
    report_type ENUM('portfolio_summary', 'performance', 'allocation', 'goal_progress', 'custom') NOT NULL,
    report_name VARCHAR(255) NOT NULL,
    parameters JSON, -- Report configuration/filters
    file_path VARCHAR(500),
    file_format ENUM('pdf', 'csv', 'xlsx') DEFAULT 'pdf',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_scheduled BOOLEAN DEFAULT FALSE,
    schedule_frequency ENUM('daily', 'weekly', 'monthly', 'quarterly') DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
);
```

### 10. Client Notes Table
```sql
CREATE TABLE client_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    note_type ENUM('meeting', 'call', 'email', 'general', 'follow_up') DEFAULT 'general',
    subject VARCHAR(255),
    content TEXT NOT NULL,
    is_private BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Calculated Views and Virtual Columns

### Portfolio Performance View
```sql
CREATE VIEW portfolio_performance AS
SELECT 
    p.id as portfolio_id,
    p.name as portfolio_name,
    p.client_id,
    SUM(h.quantity * COALESCE(h.current_price, h.cost_basis)) as current_value,
    SUM(h.quantity * h.cost_basis) as cost_basis,
    SUM(h.quantity * COALESCE(h.current_price, h.cost_basis)) - SUM(h.quantity * h.cost_basis) as unrealized_gain_loss,
    CASE 
        WHEN SUM(h.quantity * h.cost_basis) > 0 
        THEN (SUM(h.quantity * COALESCE(h.current_price, h.cost_basis)) - SUM(h.quantity * h.cost_basis)) / SUM(h.quantity * h.cost_basis) * 100
        ELSE 0 
    END as unrealized_return_percent
FROM portfolios p
LEFT JOIN holdings h ON p.id = h.portfolio_id AND h.is_active = true
WHERE p.is_active = true
GROUP BY p.id, p.name, p.client_id;
```

### Asset Allocation View
```sql
CREATE VIEW portfolio_allocation AS
SELECT 
    p.id as portfolio_id,
    h.asset_class,
    SUM(h.quantity * COALESCE(h.current_price, h.cost_basis)) as asset_value,
    SUM(h.quantity * COALESCE(h.current_price, h.cost_basis)) / 
        SUM(SUM(h.quantity * COALESCE(h.current_price, h.cost_basis))) OVER (PARTITION BY p.id) * 100 as allocation_percent
FROM portfolios p
JOIN holdings h ON p.id = h.portfolio_id AND h.is_active = true
WHERE p.is_active = true
GROUP BY p.id, h.asset_class;
```

### Goal Progress View
```sql
CREATE VIEW goal_progress AS
SELECT 
    g.id as goal_id,
    g.name as goal_name,
    g.client_id,
    g.target_amount,
    g.current_amount + COALESCE(SUM(gc.amount), 0) as total_current_amount,
    g.target_date,
    CASE 
        WHEN g.target_amount > 0 
        THEN (g.current_amount + COALESCE(SUM(gc.amount), 0)) / g.target_amount * 100
        ELSE 0 
    END as progress_percent,
    CASE 
        WHEN g.target_date IS NOT NULL 
        THEN JULIANDAY(g.target_date) - JULIANDAY('now')
        ELSE NULL 
    END as days_remaining
FROM financial_goals g
LEFT JOIN goal_contributions gc ON g.id = gc.goal_id
WHERE g.is_active = true
GROUP BY g.id, g.name, g.client_id, g.target_amount, g.current_amount, g.target_date;
```

## Indexes for Performance

### Primary Indexes
```sql
-- Client search and filtering
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_name ON clients(last_name, first_name);
CREATE INDEX idx_clients_email ON clients(email);

-- Portfolio queries
CREATE INDEX idx_portfolios_client_id ON portfolios(client_id);
CREATE INDEX idx_portfolios_type ON portfolios(portfolio_type);

-- Holdings performance queries
CREATE INDEX idx_holdings_portfolio_id ON holdings(portfolio_id);
CREATE INDEX idx_holdings_symbol ON holdings(symbol);
CREATE INDEX idx_holdings_asset_class ON holdings(asset_class);

-- Transaction queries
CREATE INDEX idx_transactions_portfolio_id ON transactions(portfolio_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);

-- Goals queries
CREATE INDEX idx_goals_client_id ON financial_goals(client_id);
CREATE INDEX idx_goals_type ON financial_goals(goal_type);
CREATE INDEX idx_goals_target_date ON financial_goals(target_date);

-- Market data lookups
CREATE INDEX idx_market_data_symbol_date ON market_data(symbol, data_date);
```

## Data Integrity and Constraints

### Business Rules Constraints
```sql
-- Ensure positive quantities and prices
ALTER TABLE holdings ADD CONSTRAINT chk_positive_quantity CHECK (quantity > 0);
ALTER TABLE holdings ADD CONSTRAINT chk_positive_cost_basis CHECK (cost_basis > 0);
ALTER TABLE holdings ADD CONSTRAINT chk_positive_current_price CHECK (current_price IS NULL OR current_price > 0);

-- Ensure valid allocation percentages
ALTER TABLE portfolios ADD CONSTRAINT chk_valid_allocation 
CHECK (json_extract(target_allocation, '$.stocks') + 
       json_extract(target_allocation, '$.bonds') + 
       json_extract(target_allocation, '$.cash') <= 100);

-- Ensure goal target amounts are positive
ALTER TABLE financial_goals ADD CONSTRAINT chk_positive_target CHECK (target_amount > 0);
ALTER TABLE financial_goals ADD CONSTRAINT chk_positive_current CHECK (current_amount >= 0);

-- Ensure valid priority levels
ALTER TABLE financial_goals ADD CONSTRAINT chk_valid_priority CHECK (priority_level BETWEEN 1 AND 5);
```

## Migration Strategy

### Phase 1: Core Tables (MVP)
1. Users
2. Clients  
3. Portfolios
4. Holdings
5. Transactions
6. Financial Goals

### Phase 2: Enhanced Features
1. Goal Contributions
2. Market Data Cache
3. Client Notes
4. Reports

### Phase 3: Advanced Features
1. Additional indexes for performance
2. Partitioning for large datasets (PostgreSQL)
3. Audit tables for compliance
4. Multi-tenancy support (SaaS)

## Sample Data Relationships

### Client → Portfolio → Holdings Flow
```
Client: John Doe (ID: 1)
├── Portfolio: Retirement 401k (ID: 1)
│   ├── Holding: VTI - 100 shares @ $220.50
│   ├── Holding: BND - 50 shares @ $75.25
│   └── Holding: VXUS - 25 shares @ $58.75
├── Portfolio: Taxable Investment (ID: 2)
│   ├── Holding: AAPL - 10 shares @ $175.00
│   └── Holding: MSFT - 15 shares @ $350.00
└── Goals:
    ├── Retirement (Target: $1,000,000 by 2055)
    └── Emergency Fund (Target: $25,000 by 2025)
```

This database design provides a solid foundation for the MVP while being flexible enough to support advanced features in future phases. 
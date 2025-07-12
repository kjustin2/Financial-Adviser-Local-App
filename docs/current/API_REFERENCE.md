# API Reference

## Overview

This document provides comprehensive API documentation for the Financial Adviser Application's REST API. All endpoints follow RESTful conventions and return JSON responses.

## Base URL

- **Development**: `http://localhost:8000`
- **API Version**: `/api/v1`
- **Full Base URL**: `http://localhost:8000/api/v1`

## Authentication

The API uses JWT (JSON Web Token) authentication. After successful login, include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-07-12T10:30:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details or validation errors"
  },
  "timestamp": "2025-07-12T10:30:00Z"
}
```

## Authentication Endpoints

### User Registration

**POST** `/api/v1/auth/register`

Register a new individual investor account.

**Request Body:**
```json
{
  "email": "investor@example.com",
  "password": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "firm_name": "Optional Firm Name",
  "license_number": "Optional License",
  "investment_experience": "intermediate",
  "risk_tolerance": "moderate",
  "investment_style": "balanced",
  "financial_goals": ["retirement", "growth"],
  "net_worth_range": "200k_500k",
  "time_horizon": "long_term",
  "portfolio_complexity": "moderate"
}
```

**Required Fields:**
- `email` - Valid email address
- `password` - Strong password (8+ chars, mixed case, numbers, symbols)
- `first_name` - First name (1-100 characters)
- `last_name` - Last name (1-100 characters)
- `investment_experience` - One of: `beginner`, `intermediate`, `advanced`
- `risk_tolerance` - One of: `conservative`, `moderate`, `aggressive`
- `investment_style` - One of: `conservative`, `balanced`, `growth`, `aggressive`
- `financial_goals` - Array of: `retirement`, `income`, `growth`, `preservation`, `education`, `major_purchase`
- `net_worth_range` - One of: `under_50k`, `50k_200k`, `200k_500k`, `500k_plus`
- `time_horizon` - One of: `short_term`, `medium_term`, `long_term`
- `portfolio_complexity` - One of: `simple`, `moderate`, `complex`

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "investor@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "investment_experience": "intermediate",
      "risk_tolerance": "moderate",
      "financial_goals": ["retirement", "growth"],
      "created_at": "2025-07-12T10:30:00Z"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

### User Login

**POST** `/api/v1/auth/login/json`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "investor@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 3600,
    "user": {
      "id": 1,
      "email": "investor@example.com",
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}
```

### Get Current User

**GET** `/api/v1/auth/me`

Get current authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "investor@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "investment_experience": "intermediate",
    "risk_tolerance": "moderate",
    "investment_style": "balanced",
    "financial_goals": ["retirement", "growth"],
    "net_worth_range": "200k_500k",
    "time_horizon": "long_term",
    "portfolio_complexity": "moderate",
    "is_active": true,
    "created_at": "2025-07-12T10:30:00Z",
    "updated_at": "2025-07-12T10:30:00Z"
  }
}
```

### Update User Profile

**PUT** `/api/v1/auth/me`

Update current user's profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (all fields optional):**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "phone": "+1987654321",
  "investment_experience": "advanced",
  "risk_tolerance": "aggressive",
  "financial_goals": ["retirement", "growth", "income"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    // Updated user object
  }
}
```

## Portfolio Management Endpoints

### List Portfolios

**GET** `/api/v1/portfolios`

Get all portfolios for the authenticated user.

**Query Parameters:**
- `skip` (optional) - Number of records to skip (default: 0)
- `limit` (optional) - Maximum number of records (default: 100)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "portfolios": [
      {
        "id": 1,
        "name": "Retirement Portfolio",
        "portfolio_type": "retirement",
        "current_value": 150000.00,
        "unrealized_gain_loss": 25000.00,
        "unrealized_return_percent": 20.0,
        "holdings_count": 8,
        "last_updated": "2025-07-12T10:30:00Z"
      }
    ],
    "total_count": 1,
    "total_value": 150000.00
  }
}
```

### Create Portfolio

**POST** `/api/v1/portfolios`

Create a new portfolio.

**Request Body:**
```json
{
  "name": "Growth Portfolio",
  "description": "Long-term growth focused portfolio",
  "portfolio_type": "growth",
  "target_allocation": {
    "stocks": 70,
    "bonds": 20,
    "cash": 10
  },
  "risk_level": "moderate",
  "benchmark_symbol": "SPY",
  "rebalance_frequency": "quarterly",
  "rebalance_threshold": 5.0
}
```

**Portfolio Types:**
- `retirement`, `growth`, `income`, `balanced`, `conservative`, `speculative`

**Risk Levels:**
- `conservative`, `moderate`, `aggressive`

**Rebalance Frequencies:**
- `monthly`, `quarterly`, `semi_annual`, `annual`, `manual`

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "user_id": 1,
    "name": "Growth Portfolio",
    "description": "Long-term growth focused portfolio",
    "portfolio_type": "growth",
    "target_allocation": {
      "stocks": 70,
      "bonds": 20,
      "cash": 10
    },
    "risk_level": "moderate",
    "benchmark_symbol": "SPY",
    "rebalance_frequency": "quarterly",
    "rebalance_threshold": 5.0,
    "is_active": true,
    "created_at": "2025-07-12T10:30:00Z",
    "updated_at": "2025-07-12T10:30:00Z",
    "current_value": 0.00,
    "total_cost_basis": 0.00,
    "unrealized_gain_loss": 0.00,
    "unrealized_return_percent": 0.0,
    "holdings_count": 0
  }
}
```

### Get Portfolio

**GET** `/api/v1/portfolios/{portfolio_id}`

Get detailed information about a specific portfolio.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    // Same structure as Create Portfolio response
  }
}
```

### Update Portfolio

**PUT** `/api/v1/portfolios/{portfolio_id}`

Update portfolio information.

**Request Body (all fields optional):**
```json
{
  "name": "Updated Portfolio Name",
  "description": "Updated description",
  "target_allocation": {
    "stocks": 80,
    "bonds": 15,
    "cash": 5
  },
  "rebalance_threshold": 3.0
}
```

### Delete Portfolio

**DELETE** `/api/v1/portfolios/{portfolio_id}`

Soft delete a portfolio (marks as inactive).

**Response (204 No Content)**

### Get Portfolio Performance

**GET** `/api/v1/portfolios/{portfolio_id}/performance`

Get detailed performance metrics for a portfolio.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "portfolio_id": 1,
    "current_value": 150000.00,
    "cost_basis": 125000.00,
    "unrealized_gain_loss": 25000.00,
    "unrealized_return_percent": 20.0,
    "day_change": null,
    "day_change_percent": null,
    "ytd_return": null,
    "ytd_return_percent": null,
    "benchmark_return": null,
    "alpha": null,
    "beta": null,
    "sharpe_ratio": null
  }
}
```

### Get Portfolio Allocation

**GET** `/api/v1/portfolios/{portfolio_id}/allocation`

Get current asset allocation breakdown.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "asset_class": "Stocks",
      "current_value": 105000.00,
      "target_percent": 70.0,
      "current_percent": 70.0,
      "drift": 0.0,
      "needs_rebalancing": false
    },
    {
      "asset_class": "Bonds",
      "current_value": 30000.00,
      "target_percent": 20.0,
      "current_percent": 20.0,
      "drift": 0.0,
      "needs_rebalancing": false
    }
  ]
}
```

## Financial Goals Endpoints

### List Goals

**GET** `/api/v1/goals`

Get all financial goals for the authenticated user.

**Query Parameters:**
- `skip` (optional) - Number of records to skip (default: 0)
- `limit` (optional) - Maximum number of records (default: 100)
- `achieved` (optional) - Filter by achievement status (true/false)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "goals": [
      {
        "id": 1,
        "name": "Retirement Savings",
        "goal_type": "retirement",
        "target_amount": 1000000.00,
        "progress_percent": 35.5,
        "target_date": "2040-12-31",
        "priority_level": "high",
        "is_achieved": false,
        "days_remaining": 5844
      }
    ],
    "total_count": 1,
    "total_target_amount": 1000000.00,
    "total_current_amount": 355000.00,
    "average_progress": 35.5
  }
}
```

### Create Goal

**POST** `/api/v1/goals`

Create a new financial goal.

**Request Body:**
```json
{
  "name": "Emergency Fund",
  "description": "6 months of expenses",
  "goal_type": "emergency_fund",
  "target_amount": 30000.00,
  "current_amount": 5000.00,
  "target_date": "2025-12-31",
  "priority_level": "high",
  "monthly_contribution": 1000.00,
  "expected_return_rate": 2.5,
  "inflation_rate": 3.0,
  "notes": "Conservative savings account"
}
```

**Goal Types:**
- `retirement`, `emergency_fund`, `education`, `house`, `vacation`, `debt_payoff`, `investment`, `other`

**Priority Levels:**
- `low`, `medium`, `high`, `critical`

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "user_id": 1,
    "name": "Emergency Fund",
    "description": "6 months of expenses",
    "goal_type": "emergency_fund",
    "target_amount": 30000.00,
    "current_amount": 5000.00,
    "target_date": "2025-12-31",
    "priority_level": "high",
    "monthly_contribution": 1000.00,
    "expected_return_rate": 2.5,
    "inflation_rate": 3.0,
    "is_achieved": false,
    "achievement_date": null,
    "notes": "Conservative savings account",
    "is_active": true,
    "created_at": "2025-07-12T10:30:00Z",
    "updated_at": "2025-07-12T10:30:00Z",
    "total_contributions": 0.00,
    "total_current_amount": 5000.00,
    "progress_percent": 16.67,
    "remaining_amount": 25000.00,
    "days_remaining": 172,
    "required_monthly_savings": 1453.49
  }
}
```

### Get Goal

**GET** `/api/v1/goals/{goal_id}`

Get detailed information about a specific goal.

### Update Goal

**PUT** `/api/v1/goals/{goal_id}`

Update goal information. Setting `is_achieved: true` will automatically set the achievement date.

### Delete Goal

**DELETE** `/api/v1/goals/{goal_id}`

Soft delete a goal.

### Get Goal Progress

**GET** `/api/v1/goals/{goal_id}/progress`

Get detailed progress information for a goal.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "goal_id": 1,
    "current_amount": 355000.00,
    "target_amount": 1000000.00,
    "progress_percent": 35.5,
    "contributions_this_month": 2000.00,
    "contributions_this_year": 24000.00,
    "projected_completion_date": "2038-05-15",
    "on_track": true
  }
}
```

### List Goal Contributions

**GET** `/api/v1/goals/{goal_id}/contributions`

Get all contributions for a specific goal.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "contributions": [
      {
        "id": 1,
        "goal_id": 1,
        "amount": 2000.00,
        "contribution_date": "2025-07-01",
        "contribution_type": "manual",
        "notes": "Monthly contribution",
        "created_at": "2025-07-01T10:00:00Z"
      }
    ],
    "total_count": 1,
    "total_amount": 2000.00
  }
}
```

### Add Goal Contribution

**POST** `/api/v1/goals/{goal_id}/contributions`

Add a contribution to a goal.

**Request Body:**
```json
{
  "goal_id": 1,
  "amount": 2000.00,
  "contribution_date": "2025-07-12",
  "contribution_type": "manual",
  "notes": "Monthly contribution"
}
```

**Contribution Types:**
- `manual`, `automatic`, `bonus`, `gift`, `transfer`, `other`

## Investment Recommendations Endpoints

### Get Personalized Recommendations

**GET** `/api/v1/recommendations/`

Get personalized investment recommendations based on user profile and current portfolio positions.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": "rec_1",
        "title": "Increase Emergency Fund",
        "description": "Your emergency fund should cover 6 months of expenses",
        "category": "emergency_fund",
        "priority": "high",
        "action_type": "increase_savings",
        "current_amount": 5000.00,
        "recommended_amount": 30000.00,
        "reasoning": "Emergency funds provide financial security and peace of mind"
      },
      {
        "id": "rec_2", 
        "title": "Rebalance Stock Allocation",
        "description": "Your stock allocation is below target for your risk profile",
        "category": "portfolio_allocation",
        "priority": "medium",
        "action_type": "rebalance",
        "portfolio_id": 1,
        "current_allocation": 65.0,
        "target_allocation": 70.0,
        "reasoning": "Maintaining target allocation optimizes risk-adjusted returns"
      }
    ],
    "summary": {
      "total_recommendations": 2,
      "high_priority_count": 1,
      "portfolio_health_score": 75
    }
  }
}
```

### Get Financial Summary

**GET** `/api/v1/recommendations/summary`

Get a comprehensive financial situation summary with key metrics.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total_net_worth": 285000.00,
    "total_portfolio_value": 150000.00,
    "liquid_assets": 25000.00,
    "monthly_savings_rate": 2000.00,
    "portfolio_diversification_score": 82,
    "risk_alignment_score": 88,
    "goal_progress_score": 67,
    "overall_financial_health": "good",
    "key_insights": [
      "Emergency fund below recommended level",
      "Investment allocation aligns well with risk tolerance",
      "Retirement savings on track for age group"
    ]
  }
}
```

## Holdings Endpoints

*Note: Holdings management is currently in development. Basic CRUD operations are planned but not yet implemented in the UI.*

### List Holdings

**GET** `/api/v1/holdings`

Get all holdings, optionally filtered by portfolio.

**Query Parameters:**
- `portfolio_id` (optional) - Filter by specific portfolio
- `skip` (optional) - Number of records to skip
- `limit` (optional) - Maximum number of records

### Create Holding

**POST** `/api/v1/holdings`

Add a new holding to a portfolio.

**Request Body:**
```json
{
  "portfolio_id": 1,
  "symbol": "AAPL",
  "asset_class": "stock",
  "quantity": 100,
  "cost_basis": 150.00,
  "purchase_date": "2025-07-01"
}
```

**Asset Classes:**
- `stock`, `bond`, `etf`, `mutual_fund`, `option`, `crypto`, `cash`, `other`

### Get Holding

**GET** `/api/v1/holdings/{holding_id}`

Get detailed information about a specific holding.

### Update Holding

**PUT** `/api/v1/holdings/{holding_id}`

Update holding information.

### Delete Holding

**DELETE** `/api/v1/holdings/{holding_id}`

Soft delete a holding.

## Transactions Endpoints

*Note: Transaction management is currently in development. Database models exist but UI implementation is pending.*

### List Transactions

**GET** `/api/v1/transactions`

Get all transactions, with optional filtering.

**Query Parameters:**
- `portfolio_id` (optional) - Filter by portfolio
- `holding_id` (optional) - Filter by holding
- `transaction_type` (optional) - Filter by transaction type
- `start_date` (optional) - Filter by date range
- `end_date` (optional) - Filter by date range
- `skip` (optional) - Number of records to skip
- `limit` (optional) - Maximum number of records

### Create Transaction

**POST** `/api/v1/transactions`

Record a new transaction.

**Request Body:**
```json
{
  "portfolio_id": 1,
  "holding_id": 1,
  "transaction_type": "buy",
  "symbol": "AAPL",
  "quantity": 50,
  "price_per_share": 155.00,
  "total_amount": 7750.00,
  "fees": 9.99,
  "transaction_date": "2025-07-12",
  "notes": "Additional purchase"
}
```

**Transaction Types:**
- `buy`, `sell`, `dividend`, `split`, `merger`, `spin_off`, `transfer_in`, `transfer_out`, `fee`, `other`

### Get Transaction

**GET** `/api/v1/transactions/{transaction_id}`

Get detailed information about a specific transaction.

### Update Transaction

**PUT** `/api/v1/transactions/{transaction_id}`

Update transaction information.

### Delete Transaction

**DELETE** `/api/v1/transactions/{transaction_id}`

Delete a transaction.

## System Endpoints

### Health Check

**GET** `/health`

Check system health and status.

**Response (200 OK):**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-07-12T10:30:00Z",
  "version": "1.0.0",
  "environment": "development",
  "components": {
    "database": "healthy",
    "logging": "healthy",
    "auth": "healthy"
  }
}
```

### Debug Information

**GET** `/debug`

Get debug information (development only).

### Validation Rules

**GET** `/validation-rules`

Get validation rules for frontend form validation.

**Response (200 OK):**
```json
{
  "success": true,
  "rules": {
    "email": {
      "required": true,
      "format": "email",
      "description": "Valid email address"
    },
    "password": {
      "required": true,
      "min_length": 8,
      "max_length": 100,
      "requirements": [
        "At least 8 characters",
        "At least one lowercase letter",
        "At least one uppercase letter",
        "At least one number",
        "At least one special character"
      ],
      "description": "Strong password with mixed case, numbers, and special characters"
    }
  }
}
```

## Error Codes

### Authentication Errors
- `INVALID_CREDENTIALS` - Invalid email or password
- `USER_NOT_FOUND` - User does not exist
- `USER_INACTIVE` - User account is deactivated
- `TOKEN_EXPIRED` - JWT token has expired
- `TOKEN_INVALID` - JWT token is malformed or invalid

### Validation Errors
- `VALIDATION_ERROR` - Request data validation failed
- `MISSING_FIELD` - Required field is missing
- `INVALID_FORMAT` - Field format is invalid
- `FIELD_TOO_LONG` - Field exceeds maximum length
- `FIELD_TOO_SHORT` - Field is below minimum length

### Resource Errors
- `RESOURCE_NOT_FOUND` - Requested resource does not exist
- `PERMISSION_DENIED` - User lacks permission for resource
- `DUPLICATE_EMAIL` - Email address already in use
- `PORTFOLIO_NOT_FOUND` - Portfolio does not exist
- `GOAL_NOT_FOUND` - Financial goal does not exist

### System Errors
- `INTERNAL_ERROR` - Unexpected server error
- `DATABASE_ERROR` - Database operation failed
- `RATE_LIMIT_EXCEEDED` - Too many requests

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Authentication endpoints**: 10 requests per minute
- **Health check**: 30 requests per minute
- **Other endpoints**: 100 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1625140800
```

## Pagination

List endpoints support pagination with `skip` and `limit` parameters:

```json
{
  "success": true,
  "data": {
    "items": [...],
    "total_count": 150,
    "skip": 0,
    "limit": 50,
    "has_more": true
  }
}
```

## Date and Time Format

All dates and timestamps use ISO 8601 format:
- **Dates**: `YYYY-MM-DD` (e.g., `2025-07-12`)
- **Timestamps**: `YYYY-MM-DDTHH:MM:SSZ` (e.g., `2025-07-12T10:30:00Z`)

All times are in UTC timezone.
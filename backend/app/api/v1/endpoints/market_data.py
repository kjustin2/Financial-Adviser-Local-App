"""Market data API endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from ....models.user import User
from ...deps import get_current_user

router = APIRouter()


class MarketIndex(BaseModel):
    """Market index data schema."""
    symbol: str
    name: str
    price: float
    change: float
    changePercent: float


class Stock(BaseModel):
    """Stock data schema."""
    symbol: str
    name: str
    price: float
    change: float
    changePercent: float


class NewsItem(BaseModel):
    """Market news item schema."""
    headline: str
    summary: str
    source: str
    timestamp: str


@router.get("/indices", response_model=List[MarketIndex])
async def get_market_indices(
    current_user: User = Depends(get_current_user),
):
    """Get major market indices."""
    # Mock data - in real implementation, this would fetch from external API
    return [
        MarketIndex(
            symbol="SPY",
            name="S&P 500 ETF",
            price=450.25,
            change=1.2,
            changePercent=0.27
        ),
        MarketIndex(
            symbol="QQQ",
            name="NASDAQ 100 ETF",
            price=380.50,
            change=-2.1,
            changePercent=-0.55
        ),
        MarketIndex(
            symbol="IWM",
            name="Russell 2000 ETF",
            price=195.75,
            change=0.8,
            changePercent=0.41
        )
    ]


@router.get("/trending", response_model=List[Stock])
async def get_trending_stocks(
    current_user: User = Depends(get_current_user),
):
    """Get trending stocks."""
    # Mock data - in real implementation, this would fetch from external API
    return [
        Stock(
            symbol="AAPL",
            name="Apple Inc.",
            price=175.30,
            change=2.15,
            changePercent=1.24
        ),
        Stock(
            symbol="MSFT",
            name="Microsoft Corp.",
            price=340.80,
            change=-1.20,
            changePercent=-0.35
        ),
        Stock(
            symbol="GOOGL",
            name="Alphabet Inc.",
            price=140.25,
            change=3.45,
            changePercent=2.52
        ),
        Stock(
            symbol="TSLA",
            name="Tesla Inc.",
            price=245.60,
            change=-8.30,
            changePercent=-3.27
        ),
        Stock(
            symbol="AMZN",
            name="Amazon.com Inc.",
            price=155.80,
            change=4.20,
            changePercent=2.77
        )
    ]


@router.get("/news", response_model=List[NewsItem])
async def get_market_news(
    current_user: User = Depends(get_current_user),
):
    """Get latest market news."""
    # Mock data - in real implementation, this would fetch from external API
    return [
        NewsItem(
            headline="Market Rally Continues as Tech Stocks Surge",
            summary="Technology stocks led the market higher today as investors showed renewed confidence in growth stocks.",
            source="Financial News",
            timestamp="2024-01-15T15:30:00Z"
        ),
        NewsItem(
            headline="Federal Reserve Maintains Interest Rates",
            summary="The Federal Reserve announced it will keep interest rates unchanged at the current level, citing economic stability.",
            source="Reuters",
            timestamp="2024-01-15T14:00:00Z"
        ),
        NewsItem(
            headline="Earnings Season Kicks Off with Strong Results",
            summary="Major banks and financial institutions report better-than-expected quarterly earnings, setting a positive tone.",
            source="Bloomberg",
            timestamp="2024-01-15T13:15:00Z"
        )
    ]


@router.get("/search", response_model=List[Stock])
async def search_stocks(
    q: str = Query(..., description="Search query for stocks"),
    current_user: User = Depends(get_current_user),
):
    """Search for stocks by symbol or company name."""
    # Mock search results - in real implementation, this would search external API
    all_stocks = [
        Stock(symbol="AAPL", name="Apple Inc.", price=175.30, change=2.15, changePercent=1.24),
        Stock(symbol="MSFT", name="Microsoft Corp.", price=340.80, change=-1.20, changePercent=-0.35),
        Stock(symbol="GOOGL", name="Alphabet Inc.", price=140.25, change=3.45, changePercent=2.52),
        Stock(symbol="AMZN", name="Amazon.com Inc.", price=155.80, change=4.20, changePercent=2.77),
        Stock(symbol="TSLA", name="Tesla Inc.", price=245.60, change=-8.30, changePercent=-3.27),
        Stock(symbol="NVDA", name="NVIDIA Corp.", price=520.30, change=12.45, changePercent=2.45),
        Stock(symbol="META", name="Meta Platforms Inc.", price=380.90, change=-5.20, changePercent=-1.35),
        Stock(symbol="NFLX", name="Netflix Inc.", price=485.60, change=8.75, changePercent=1.83),
    ]
    
    # Filter stocks based on query
    query_lower = q.lower()
    filtered_stocks = [
        stock for stock in all_stocks
        if query_lower in stock.symbol.lower() or query_lower in stock.name.lower()
    ]
    
    return filtered_stocks[:10]  # Limit to 10 results


@router.get("/stock/{symbol}", response_model=Stock)
async def get_stock_data(
    symbol: str,
    current_user: User = Depends(get_current_user),
):
    """Get detailed data for a specific stock."""
    # Mock data - in real implementation, this would fetch from external API
    stock_data = {
        "AAPL": Stock(symbol="AAPL", name="Apple Inc.", price=175.30, change=2.15, changePercent=1.24),
        "MSFT": Stock(symbol="MSFT", name="Microsoft Corp.", price=340.80, change=-1.20, changePercent=-0.35),
        "GOOGL": Stock(symbol="GOOGL", name="Alphabet Inc.", price=140.25, change=3.45, changePercent=2.52),
    }
    
    if symbol.upper() not in stock_data:
        # Return a generic stock for unknown symbols
        return Stock(
            symbol=symbol.upper(),
            name=f"{symbol.upper()} Corp.",
            price=100.00,
            change=0.00,
            changePercent=0.00
        )
    
    return stock_data[symbol.upper()]
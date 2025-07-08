"""Client management endpoints."""

from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from ....database import get_db
from ....models.client import Client
from ....models.user import User
from ....schemas.client import (
    ClientCreate,
    ClientList,
    ClientResponse,
    ClientSummary,
    ClientUpdate,
)
from ....schemas.common import PaginatedResponse, StandardResponse
from ...deps import get_current_active_user

router = APIRouter()


@router.post(
    "/",
    response_model=StandardResponse[ClientResponse],
    status_code=status.HTTP_201_CREATED,
)
def create_client(
    client_data: ClientCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """Create a new client."""
    db_client = Client(user_id=current_user.id, **client_data.dict())

    db.add(db_client)
    db.commit()
    db.refresh(db_client)

    return StandardResponse(
        data=ClientResponse.from_orm(db_client), message="Client created successfully"
    )


@router.get("/", response_model=PaginatedResponse[ClientSummary])
def list_clients(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name or email"),
) -> Any:
    """List all clients for the current user."""
    query = db.query(Client).filter(
        Client.user_id == current_user.id, Client.is_active == True
    )

    # Apply search filter
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Client.first_name.ilike(search_pattern))
            | (Client.last_name.ilike(search_pattern))
            | (Client.email.ilike(search_pattern))
        )

    # Get total count
    total = query.count()

    # Apply pagination
    clients = query.offset((page - 1) * size).limit(size).all()

    # Calculate total pages
    pages = (total + size - 1) // size

    # Convert to summary format
    client_summaries = []
    for client in clients:
        # Calculate portfolio stats (simplified for now)
        total_portfolio_value = sum(
            portfolio.total_value
            for portfolio in client.portfolios
            if portfolio.is_active
        )

        client_summaries.append(
            ClientSummary(
                id=client.id,
                first_name=client.first_name,
                last_name=client.last_name,
                email=client.email,
                risk_tolerance=client.risk_tolerance,
                total_portfolio_value=total_portfolio_value,
                portfolios_count=len([p for p in client.portfolios if p.is_active]),
                goals_count=len([g for g in client.financial_goals if g.is_active]),
            )
        )

    return PaginatedResponse(
        data=client_summaries,
        pagination={"page": page, "size": size, "total": total, "pages": pages},
    )


@router.get("/{client_id}", response_model=StandardResponse[ClientResponse])
def get_client(
    client_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """Get a specific client by ID."""
    client = (
        db.query(Client)
        .filter(
            Client.id == client_id,
            Client.user_id == current_user.id,
            Client.is_active == True,
        )
        .first()
    )

    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Client not found"
        )

    # Calculate additional fields
    total_portfolio_value = sum(
        portfolio.total_value for portfolio in client.portfolios if portfolio.is_active
    )

    client_response = ClientResponse.from_orm(client)
    client_response.total_portfolio_value = total_portfolio_value
    client_response.full_name = client.full_name
    client_response.age = client.age

    return StandardResponse(
        data=client_response, message="Client retrieved successfully"
    )


@router.put("/{client_id}", response_model=StandardResponse[ClientResponse])
def update_client(
    client_id: int,
    client_data: ClientUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """Update a client."""
    client = (
        db.query(Client)
        .filter(
            Client.id == client_id,
            Client.user_id == current_user.id,
            Client.is_active == True,
        )
        .first()
    )

    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Client not found"
        )

    # Update fields
    update_data = client_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(client, field, value)

    db.commit()
    db.refresh(client)

    return StandardResponse(
        data=ClientResponse.from_orm(client), message="Client updated successfully"
    )


@router.delete("/{client_id}")
def delete_client(
    client_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """Delete (deactivate) a client."""
    client = (
        db.query(Client)
        .filter(
            Client.id == client_id,
            Client.user_id == current_user.id,
            Client.is_active == True,
        )
        .first()
    )

    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Client not found"
        )

    # Soft delete
    client.is_active = False
    db.commit()

    return {"message": "Client deleted successfully"}


@router.get("/{client_id}/portfolios")
def get_client_portfolios(
    client_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """Get all portfolios for a specific client."""
    client = (
        db.query(Client)
        .filter(
            Client.id == client_id,
            Client.user_id == current_user.id,
            Client.is_active == True,
        )
        .first()
    )

    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Client not found"
        )

    active_portfolios = [p for p in client.portfolios if p.is_active]

    return StandardResponse(
        data=active_portfolios,
        message=f"Found {len(active_portfolios)} portfolios for client",
    )

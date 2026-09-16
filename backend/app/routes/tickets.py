from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.ticket import Ticket
from app.schemas.ticket import (
    TicketCreate,
    TicketResponse,
    TicketListResponse
)
from app.services.ai_service import classify_ticket
from app.auth.dependencies import get_current_admin

router = APIRouter(
    prefix="/api/tickets",
    tags=["Tickets"]
)



@router.post(
    "",
    response_model=TicketResponse,
    status_code=status.HTTP_201_CREATED
)
def create_ticket(
    ticket_data: TicketCreate,
    db: Session = Depends(get_db)
):
    ticket = Ticket(
        customer_name=ticket_data.customer_name,
        customer_email=ticket_data.customer_email,
        subject=ticket_data.subject,
        description=ticket_data.description,
        status="Open",
        category="General",
        priority="Medium"
    )

    db.add(ticket)

    # Get the auto-generated ticket ID
    db.flush()

    # Generate reference number
    ticket.reference_number = f"TKT-{ticket.id:05d}"

    # AI classification
    ai_result = classify_ticket(
        ticket.subject,
        ticket.description
    )

    ticket.category = ai_result["category"]
    ticket.priority = ai_result["priority"]
    ticket.ai_summary = ai_result["summary"]

    db.commit()
    db.refresh(ticket)

    return ticket


@router.get(
    "",
    response_model=TicketListResponse
)
def get_all_tickets(
    search: str | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
    category_filter: str | None = Query(default=None, alias="category"),
    priority_filter: str | None = Query(default=None, alias="priority"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    query = db.query(Ticket)

    # Search by reference, subject, or email
    if search:
        search_value = f"%{search}%"

        query = query.filter(
            (Ticket.reference_number.like(search_value)) |
            (Ticket.subject.like(search_value)) |
            (Ticket.customer_email.like(search_value))
        )

    # Filter by status
    if status_filter:
        query = query.filter(
            Ticket.status == status_filter
        )

    # Filter by category
    if category_filter:
        query = query.filter(
            Ticket.category == category_filter
        )

    # Filter by priority
    if priority_filter:
        query = query.filter(
            Ticket.priority == priority_filter
        )

    # Total matching tickets
    total = query.count()

    # Calculate pagination
    offset = (page - 1) * page_size

    total_pages = (total + page_size - 1) // page_size

    # Get current page tickets
    tickets = (
        query
        .order_by(Ticket.created_at.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )

    # Return pagination response
    return {
        "items": tickets,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages
    }
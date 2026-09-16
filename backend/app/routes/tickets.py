from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.ticket import Ticket
from app.models.status_history import StatusHistory
from app.schemas.ticket import (
    TicketCreate,
    TicketResponse,
    TicketListResponse,
    TicketDetailResponse,
    StatusUpdateRequest
)
from app.auth.dependencies import get_current_admin
from app.services.ai_service import classify_ticket


router = APIRouter(
    prefix="/api/tickets",
    tags=["Tickets"]
)


# --------------------------------------------------
# CREATE TICKET
# --------------------------------------------------

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
    db.flush()

    ticket.reference_number = f"TKT-{ticket.id:05d}"

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


# --------------------------------------------------
# GET ALL TICKETS
# SEARCH + FILTER + PAGINATION
# --------------------------------------------------

@router.get(
    "",
    response_model=TicketListResponse
)
def get_all_tickets(
    search: str | None = Query(default=None),

    status_filter: str | None = Query(
        default=None,
        alias="status"
    ),

    category_filter: str | None = Query(
        default=None,
        alias="category"
    ),

    priority_filter: str | None = Query(
        default=None,
        alias="priority"
    ),

    page: int = Query(
        default=1,
        ge=1
    ),

    page_size: int = Query(
        default=10,
        ge=1,
        le=100
    ),

    db: Session = Depends(get_db),

    current_admin=Depends(get_current_admin)
):
    query = db.query(Ticket)

    # Search
    if search:
        search_value = f"%{search}%"

        query = query.filter(
            (Ticket.reference_number.like(search_value)) |
            (Ticket.subject.like(search_value)) |
            (Ticket.customer_email.like(search_value))
        )

    # Status filter
    if status_filter:
        query = query.filter(
            Ticket.status == status_filter
        )

    # Category filter
    if category_filter:
        query = query.filter(
            Ticket.category == category_filter
        )

    # Priority filter
    if priority_filter:
        query = query.filter(
            Ticket.priority == priority_filter
        )

    total = query.count()

    offset = (page - 1) * page_size

    total_pages = (
        total + page_size - 1
    ) // page_size

    tickets = (
        query
        .order_by(Ticket.created_at.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )

    return {
        "items": tickets,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages
    }


# --------------------------------------------------
# GET TICKET DETAIL
# --------------------------------------------------

@router.get(
    "/{ticket_id}",
    response_model=TicketDetailResponse
)
def get_ticket_detail(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    ticket = (
        db.query(Ticket)
        .filter(Ticket.id == ticket_id)
        .first()
    )

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )

    history = (
        db.query(StatusHistory)
        .filter(
            StatusHistory.ticket_id == ticket_id
        )
        .order_by(
            StatusHistory.created_at.asc()
        )
        .all()
    )

    return {
        "id": ticket.id,
        "reference_number": ticket.reference_number,
        "customer_name": ticket.customer_name,
        "customer_email": ticket.customer_email,
        "subject": ticket.subject,
        "description": ticket.description,
        "status": ticket.status,
        "category": ticket.category,
        "priority": ticket.priority,
        "ai_summary": ticket.ai_summary,
        "created_at": ticket.created_at,
        "updated_at": ticket.updated_at,
        "status_history": history
    }


# --------------------------------------------------
# UPDATE TICKET STATUS
# --------------------------------------------------

@router.patch(
    "/{ticket_id}/status",
    response_model=TicketDetailResponse
)
def update_ticket_status(
    ticket_id: int,
    status_data: StatusUpdateRequest,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    # Find ticket
    ticket = (
        db.query(Ticket)
        .filter(Ticket.id == ticket_id)
        .first()
    )

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )

    # Allowed statuses
    allowed_statuses = [
        "Open",
        "In Progress",
        "Resolved",
        "Closed"
    ]

    new_status = status_data.status.strip()

    if new_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Allowed values: Open, In Progress, Resolved, Closed"
        )

    # Store previous status
    previous_status = ticket.status

    # Update ticket status
    ticket.status = new_status

    # Create status history
    history = StatusHistory(
        ticket_id=ticket.id,
        previous_status=previous_status,
        new_status=new_status,
        remark=status_data.remark,
        admin_user_id=current_admin.id
    )

    db.add(history)

    # Save changes
    db.commit()
    db.refresh(ticket)

    # Get updated history
    updated_history = (
        db.query(StatusHistory)
        .filter(
            StatusHistory.ticket_id == ticket.id
        )
        .order_by(
            StatusHistory.created_at.asc()
        )
        .all()
    )

    return {
        "id": ticket.id,
        "reference_number": ticket.reference_number,
        "customer_name": ticket.customer_name,
        "customer_email": ticket.customer_email,
        "subject": ticket.subject,
        "description": ticket.description,
        "status": ticket.status,
        "category": ticket.category,
        "priority": ticket.priority,
        "ai_summary": ticket.ai_summary,
        "created_at": ticket.created_at,
        "updated_at": ticket.updated_at,
        "status_history": updated_history
    }
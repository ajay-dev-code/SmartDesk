from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, timedelta

class TicketCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=100)
    customer_email: EmailStr
    subject: str = Field(min_length=3, max_length=255)
    description: str = Field(min_length=5)


class TicketResponse(BaseModel):
    id: int
    reference_number: str
    customer_name: str
    customer_email: EmailStr
    subject: str
    description: str
    status: str
    category: str
    priority: str
    ai_summary: str | None = None

    class Config:
        from_attributes = True


class TicketListResponse(BaseModel):
    items: list[TicketResponse]
    page: int
    page_size: int
    total: int
    total_pages: int


class StatusHistoryResponse(BaseModel):
    id: int
    previous_status: str | None = None
    new_status: str
    remark: str | None = None
    admin_user_id: int
    created_at: object

    class Config:
        from_attributes = True


class TicketDetailResponse(TicketResponse):
    created_at: object
    updated_at: object | None = None
    status_history: list[StatusHistoryResponse] = []

class StatusUpdateRequest(BaseModel):
    status: str
    remark: str | None = None  

class ClassificationUpdateRequest(BaseModel):
    category: str
    priority: str 

class DashboardLatestTicket(BaseModel):
    id: int
    reference_number: str
    subject: str
    customer_name: str
    category: str
    priority: str
    status: str
    created_at: object

    class Config:
        from_attributes = True


class DashboardResponse(BaseModel):
    total_tickets: int
    open_tickets: int
    in_progress_tickets: int
    resolved_tickets: int
    closed_tickets: int

    category_counts: dict[str, int]
    priority_counts: dict[str, int]

    last_7_days: list[dict]

    latest_tickets: list[DashboardLatestTicket]        
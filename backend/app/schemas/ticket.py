from pydantic import BaseModel, EmailStr, Field


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
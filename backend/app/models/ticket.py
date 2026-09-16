from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, text

from app.database.database import Base


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)

    reference_number = Column(
        String(20),
        unique=True,
        index=True
    )

    customer_name = Column(String(100), nullable=False)

    customer_email = Column(
        String(150),
        nullable=False,
        index=True
    )

    subject = Column(
        String(255),
        nullable=False
    )

    description = Column(
        Text,
        nullable=False
    )

    status = Column(
        String(20),
        nullable=False,
        default="Open",
        index=True
    )

    category = Column(
        String(20),
        nullable=False,
        default="General",
        index=True
    )

    priority = Column(
        String(20),
        nullable=False,
        default="Medium",
        index=True
    )

    ai_summary = Column(String(500))

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP"),
        index=True
    )

    updated_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP")
    )
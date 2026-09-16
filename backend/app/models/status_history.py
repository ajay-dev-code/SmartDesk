from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, text

from app.database.database import Base


class StatusHistory(Base):
    __tablename__ = "status_history"

    id = Column(Integer, primary_key=True, index=True)

    ticket_id = Column(
        Integer,
        ForeignKey("tickets.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    previous_status = Column(String(20))

    new_status = Column(
        String(20),
        nullable=False
    )

    remark = Column(String(500))

    admin_user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )
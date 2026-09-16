from app.database.database import SessionLocal
from app.models.user import User
from app.auth.password import hash_password


def seed_admin():
    db = SessionLocal()

    try:
        existing_admin = (
            db.query(User)
            .filter(User.email == "admin@smartdesk.com")
            .first()
        )

        if existing_admin:
            print("Admin already exists.")
            return

        admin = User(
            name="SmartDesk Admin",
            email="admin@smartdesk.com",
            password_hash=hash_password("admin123"),
            role="ADMIN"
        )

        db.add(admin)
        db.commit()

        print("Admin account created successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()
import os

from dotenv import load_dotenv

from app.database.database import SessionLocal
from app.models.user import User
from app.auth.password import hash_password


load_dotenv()


def seed_admin():
    db = SessionLocal()

    try:
        admin_email = os.getenv("ADMIN_EMAIL")
        admin_password = os.getenv("ADMIN_PASSWORD")
        admin_name = os.getenv("ADMIN_NAME", "SmartDesk Admin")

        if not admin_email or not admin_password:
            print("Admin credentials are not configured in .env")
            return

        existing_admin = (
            db.query(User)
            .filter(User.email == admin_email)
            .first()
        )

        if existing_admin:
            print("Admin already exists.")
            return

        admin = User(
            name=admin_name,
            email=admin_email,
            password_hash=hash_password(admin_password),
            role="ADMIN"
        )

        db.add(admin)
        db.commit()

        print("Admin account created successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()
from fastapi import FastAPI
from sqlalchemy import text

from app.database.database import engine
from app.routes.auth import router as auth_router

app = FastAPI(title="SmartDesk API")

app.include_router(auth_router)
@app.get("/")
def home():
    return {"message": "SmartDesk API is running"}


@app.get("/test-db")
def test_db():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT DATABASE()"))
        database_name = result.scalar()

    return {
        "message": "Database connection successful",
        "database": database_name
    }
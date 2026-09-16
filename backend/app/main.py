from fastapi import FastAPI

app = FastAPI(title="SmartDesk API")


@app.get("/")
def home():
    return {"message": "SmartDesk API is running"}
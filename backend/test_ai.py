from app.services.ai_service import classify_ticket


result = classify_ticket(
    "Cannot login to my account",
    "I have entered my correct password several times, but I am unable to login."
)

print("AI Result:")
print(result)
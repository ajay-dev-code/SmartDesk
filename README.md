# SmartDesk

SmartDesk is an AI-assisted support ticket management system built as a technical assessment project.

The system allows customers to raise support tickets through a public support portal. Each ticket is validated and stored in the database, then an AI service suggests the ticket category, priority, and a short summary.

Administrators can log in securely, view and manage tickets, search and filter tickets, update ticket status, correct AI classifications, and view the complete status history.

## Key Features

- Public support ticket submission
- Server-side and browser-side validation
- Automatic ticket reference number generation
- AI-assisted ticket classification
- Admin login with JWT authentication
- Role-based admin authorization
- Ticket search, filtering, and pagination
- Ticket detail and status history
- Ticket status management
- Manual category and priority correction
- Admin dashboard with ticket counts
- Responsive frontend
- REST APIs
- MySQL database

## Technology Stack

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication
- Passlib + Bcrypt

### Frontend

- HTML5
- CSS3
- JavaScript

### Database

- MySQL

### AI

- Google Gemini API

### Development Tools

- Visual Studio Code
- MySQL Workbench
- Git
- GitHub
- Swagger / OpenAPI

## Project Structure

Smartdesk/
├── backend/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── dependencies.py
│   │   │   ├── jwt.py
│   │   │   └── password.py
│   │   │
│   │   ├── database/
│   │   │   └── database.py
│   │   │
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── ticket.py
│   │   │   └── status_history.py
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   └── tickets.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── ticket.py
│   │   │   └── user.py
│   │   │
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── seed_admin.py
│   └── requirements.txt
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── dashboard.html
│   ├── tickets.html
│   ├── ticket-detail.html
│   ├── confirmation.html
│   │
│   ├── css/
│   │   └── style.css
│   │
│   └── js/
│       ├── auth.js
│       ├── dashboard.js
│       ├── tickets.js
│       └── ticket-detail.js
│
└── README.md

## System Architecture

SmartDesk follows a layered architecture where the frontend communicates with the backend through REST APIs.

Customer / Admin
       │
       ▼
HTML + CSS + JavaScript
       │
       │ HTTP / REST API
       ▼
FastAPI Backend
       │
       ├── Routes
       │      │
       │      ▼
       │   Services
       │      │
       │      ▼
       │   SQLAlchemy
       │      │
       │      ▼
       │    MySQL
       │
       └── Gemini AI
              │
              ▼
       Ticket Classification
       Category / Priority / Summary

## Backend Layer Responsibilities

### Routes

Handles HTTP requests and API endpoints.

Examples:
- Admin login
- Ticket creation
- Ticket listing
- Ticket detail
- Ticket status update
- Ticket classification update
- Dashboard

### Schemas

Uses Pydantic models to validate request and response data.

Examples:
- LoginRequest
- TicketCreate
- StatusUpdateRequest
- ClassificationUpdateRequest

### Models

Uses SQLAlchemy models to represent database tables.

Main models:
- User
- Ticket
- StatusHistory

### Services

Contains reusable business logic, including AI ticket classification.

### Database

SQLAlchemy connects the application to MySQL and performs database operations.

### Authentication

JWT-based authentication protects admin APIs. Passwords are securely hashed using Bcrypt.

## Authentication and Authorization Flow

Admin Login
     ↓
Email + Password
     ↓
Find User in MySQL
     ↓
Verify Bcrypt Password
     ↓
Generate JWT Token
     ↓
Frontend Receives Token
     ↓
Token Sent as Bearer Token
     ↓
FastAPI Validates JWT
     ↓
Find Current User
     ↓
Check User Role
     ↓
ADMIN Authorization
     ↓
Access Protected API

## REST API Endpoints

### Authentication

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Admin login and JWT token generation |

### Tickets

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| POST | `/api/tickets` | Public | Create a new support ticket |
| GET | `/api/tickets` | JWT | List tickets with search, filters, and pagination |
| GET | `/api/tickets/{id}` | JWT | Get ticket details and status history |
| PATCH | `/api/tickets/{id}/status` | Admin JWT | Update ticket status and create history |
| PATCH | `/api/tickets/{id}/classification` | Admin JWT | Correct ticket category and priority |
| GET | `/api/tickets/dashboard` | Admin JWT | Get dashboard ticket statistics and recent activity |
### Example Login Request

json
{
    "email": "admin@smartdesk.com",
    "password": "your-password"
}
## Database

SmartDesk uses MySQL as its relational database.

### Database Name

smartdesk_db

users
  │
  │ 1
  │
  │ many
  ▼
status_history
  ▲
  │ many
  │
  │ 1
tickets

### Database Setup

The database schema is provided in:

`database/schema.sql`

To create the database and tables:

1. Open MySQL Workbench.
2. Open `database/schema.sql`.
3. Execute the script.

The script creates:

- `smartdesk_db`
- `users`
- `tickets`
- `status_history`

The `status_history` table maintains relationships with both `tickets` and `users` using foreign keys.

### Admin Seed Data

After creating the database, run the admin seed script:

```bash
cd backend
python seed_admin.py

The default administrator account created by the seed script is:

- Email: Value configured in `ADMIN_EMAIL`
- Password: Value configured in `ADMIN_PASSWORD`
- Role: `ADMIN`

The password is securely hashed before being stored in the database.

## AI Integration

SmartDesk uses the Google Gemini API to assist with automatic ticket classification.

When a customer creates a ticket, the backend sends the ticket subject and description to the AI service.

The AI suggests:

- Category
- Priority
- Short summary

### AI Processing Flow

Customer creates ticket
        ↓
Ticket saved with default values
        ↓
Subject + Description
        ↓
Gemini AI
        ↓
Category + Priority + Summary
        ↓
Validate AI response
        ↓
Update ticket

## Setup and Installation

### Prerequisites

Make sure the following are installed:

- Python 3.x
- MySQL
- Git
- Visual Studio Code

### 1. Clone the Repository

```bash
git clone <your-github-repository-url>
cd Smartdesk
### 2. Backend Setup

cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt
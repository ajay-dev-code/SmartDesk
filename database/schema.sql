CREATE DATABASE IF NOT EXISTS smartdesk_db;

USE smartdesk_db;


-- =========================
-- USERS TABLE
-- =========================

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ADMIN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================
-- TICKETS TABLE
-- =========================

CREATE TABLE IF NOT EXISTS tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reference_number VARCHAR(20) UNIQUE,

    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,

    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'Open',
    category VARCHAR(20) NOT NULL DEFAULT 'General',
    priority VARCHAR(20) NOT NULL DEFAULT 'Medium',

    ai_summary VARCHAR(500),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_ticket_email (customer_email),
    INDEX idx_ticket_status (status),
    INDEX idx_ticket_category (category),
    INDEX idx_ticket_priority (priority),
    INDEX idx_ticket_created_at (created_at)
);


-- =========================
-- STATUS HISTORY TABLE
-- =========================

CREATE TABLE IF NOT EXISTS status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,

    ticket_id INT NOT NULL,
    previous_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,

    remark VARCHAR(500),

    admin_user_id INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_history_ticket
        FOREIGN KEY (ticket_id)
        REFERENCES tickets(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_history_admin
        FOREIGN KEY (admin_user_id)
        REFERENCES users(id)
);


-- =========================
-- ADMIN SEED
-- =========================
-- The initial administrator account is created using:
-- backend/seed_admin.py
--
-- Admin credentials are configured through the .env file.
-- Do not store administrator passwords or secrets in this SQL file.
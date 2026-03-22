CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       username VARCHAR(50) UNIQUE NOT NULL,
                       email VARCHAR(100) UNIQUE NOT NULL,
                       password VARCHAR(255) NOT NULL,
                       score DECIMAL(10,2) DEFAULT 0.0,
                       phone_number VARCHAR(20),
                       is_moderator BOOLEAN DEFAULT FALSE,
                       is_blocked BOOLEAN DEFAULT FALSE,
                       created_at TIMESTAMP DEFAULT NOW()
);
CREATE TYPE post_status AS ENUM ('POSTED', 'IN_PROGRESS', 'RESOLVED');

CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    text TEXT NOT NULL,
    image_url VARCHAR(500),
    status post_status DEFAULT 'POSTED',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
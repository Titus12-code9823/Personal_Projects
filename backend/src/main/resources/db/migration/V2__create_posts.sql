CREATE TYPE post_status AS ENUM ('JUST_POSTED', 'FIRST_REACTIONS', 'EXPIRED');

CREATE TABLE posts (
                       id BIGSERIAL PRIMARY KEY,
                       user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                       title VARCHAR(200) NOT NULL,
                       text TEXT NOT NULL,
                       image_url VARCHAR(500) NOT NULL,
                       status post_status DEFAULT 'JUST_POSTED',
                       created_at TIMESTAMP DEFAULT NOW(),
                       updated_at TIMESTAMP DEFAULT NOW()
);
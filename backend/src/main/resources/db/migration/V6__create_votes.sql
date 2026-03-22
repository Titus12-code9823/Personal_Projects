CREATE TYPE target_type AS ENUM ('POST', 'COMMENT');
CREATE TYPE vote_type AS ENUM ('UPVOTE', 'DOWNVOTE');

CREATE TABLE votes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type target_type NOT NULL,
    target_id BIGINT NOT NULL,
    vote_type vote_type NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (user_id, target_type, target_id)
);
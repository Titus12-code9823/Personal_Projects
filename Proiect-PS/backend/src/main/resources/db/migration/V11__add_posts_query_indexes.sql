CREATE INDEX IF NOT EXISTS idx_posts_user_id_created_at_desc
    ON posts (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_created_at_desc
    ON posts (created_at DESC);

ALTER TABLE users
    ALTER COLUMN avatar_url SET DEFAULT 'https://i.imgur.com/O0pHtgD.jpeg';

UPDATE users
SET avatar_url = 'https://i.imgur.com/O0pHtgD.jpeg'
WHERE avatar_url IS NULL
   OR btrim(avatar_url) = '';

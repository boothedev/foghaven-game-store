-- 1. Get game list by page and page size
SELECT                                              
  id, name, price, introduction, landscape, release_date, rating
ORDER BY rater_count DESC
LIMIT :limit
OFFSET ((:page - 1) * :limit);

-- 2. Get game list with extended tuples, filters, and ordering
SELECT
  id, name, price, introduction, landscape, release_date, rating,
  (SELECT GROUP_CONCAT(genre_id)
    FROM (SELECT genre_id
        FROM game_genres
        WHERE game_id = id
        ORDER BY weight DESC
        LIMIT 3)) genre_ids,
  (SELECT GROUP_CONCAT(platform_id)
    FROM game_platforms
    WHERE game_id = id) platform_ids
FROM games
WHERE EXISTS (
SELECT 1 FROM game_genres
WHERE id = game_id AND genre_id IN (?,?,..))
  AND EXISTS (
SELECT 1 FROM game_platforms
WHERE id = game_id AND platform_id IN (?,?,..))
ORDER BY rater_count DESC
LIMIT :limit
OFFSET ((:page - 1) * :limit);

-- 3. Get a game (by game id)
SELECT *
FROM games
WHERE id = :game_id;

-- 4. Get genre list
SELECT * 
FROM genres
ORDER BY weight DESC;

-- 5. Get genre list of a game (by game id)
SELECT genres.id, genres.name, genres.icon 
FROM genres
JOIN game_genres ON genres.id = game_genres.genre_id
WHERE game_genres.game_id = :game_id
ORDER BY weight DESC;

-- 6. Get platform list
SELECT * 
FROM platforms
ORDER BY weight DESC;

-- 7. Get platform list of a game (by game id) with requirements
SELECT platforms.id,
       platforms.name,
       platforms.value,
       game_platforms.min_requirements,
       game_platforms.rec_requirements
FROM platforms
JOIN game_platforms ON platforms.id = game_platforms.platform_id
WHERE game_platforms.game_id = :game_id;

-- 8. Get a genre (by genre id)
SELECT * 
FROM genres 
WHERE id = :genre_id;

-- 9. Get a platform (by platform id)
SELECT *
FROM platforms 
WHERE id = :platform_id;

-- 10. Get screenshot list of a game (by game id)
SELECT * 
FROM screenshots
WHERE game_id = :game_id;

-- 11. Get movie list of a game (by game id)
SELECT * 
FROM movies
WHERE game_id = :game_id;

-- 12. Get a user account (without password)
SELECT id, username, balance
FROM users
WHERE id = :user_id;

-- 13. Create a user account
INSERT INTO users (username, password, balance)
VALUES (:user_name, :password, 0);

-- 14. Update user account balance
UPDATE users
SET balance = :balance
WHERE id = :user_id;

-- 15. Update user account password
UPDATE users
SET password = :password
WHERE id = :user_id;

-- 16. Get payment card list of a user
SELECT *
FROM payment_cards
WHERE user_id = :user_id;

-- 17. Add a payment card
INSERT INTO payment_cards (user_id, name, number, exp_month, exp_year, security_code)
VALUES (:user_id, :name_on_card, :card_number, :exp_month, :exp_year, :security_code);

-- 18. Remove a payment card
DELETE FROM payment_cards
WHERE id = :card_id;

-- 19. Link a game to a user (buy a game)
INSERT INTO game_users (game_id, user_id, stars, owned_at)
VALUES (:game_id, :user_id, NULL, DATETIME('now'));

-- 20. Rate a game
UPDATE game_users
SET stars = :stars
WHERE user_id = :user_id
    AND game_id = :game_id;

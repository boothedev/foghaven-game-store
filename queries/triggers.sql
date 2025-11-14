CREATE TRIGGER after_game_users_update
AFTER UPDATE ON game_users
FOR EACH ROW
BEGIN
    UPDATE games
    SET stars = stars - COALESCE(OLD.stars, 0) + COALESCE(NEW.stars, 0),
        rater_count = rater_count + (
            CASE
                WHEN OLD.stars IS NULL THEN 1
                WHEN NEW.stars IS NULL THEN -1
                ELSE 0
            END)
    WHERE game_id = NEW.game_id;
    --
    UPDATE games
    SET rating = stars / COALESCE(rater_count, 1)
    WHERE game_id = NEW.game_id;
END;

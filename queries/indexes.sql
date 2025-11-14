CREATE INDEX idx_game_screenshorts_game_id ON screenshots(game_id);
CREATE INDEX idx_game_movies_game_id ON movies(game_id);
CREATE INDEX idx_game_users_user_id ON game_users(user_id);
CREATE INDEX idx_game_genres_genre_id ON game_genres(genre_id);
CREATE INDEX idx_game_platforms_platform_id ON game_platforms(platform_id);

CREATE INDEX idx_game_rating ON games(rating);
CREATE INDEX idx_game_rater_count ON games(rater_count);
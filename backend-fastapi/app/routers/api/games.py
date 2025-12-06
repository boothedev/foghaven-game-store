from typing import Annotated, Optional

from fastapi import APIRouter, Cookie, HTTPException, Query

from app.db import get_dbconn
from app.schemas import FilterParams, GameRate
from app.utils.authenticate import extract_access_token
from app.utils.sqlresult import sqlresult_to_dict, sqlresult_to_dictlist

router = APIRouter(prefix="/games")


def _search_games(conn, search: str):
    # Split keywords and use wildcard matches with SQLite concatenation
    keywords = search.split()
    if not keywords:
        return []

    where_clauses = []
    params = []
    for kw in keywords:
        where_clauses.append("name LIKE ?")
        params.append(f"%{kw}%")

    sql = f"""
    SELECT id, name, price, landscape, release_date, rating
    FROM games
    WHERE {" AND ".join(where_clauses)}
    ORDER BY rater_count
    LIMIT 5
    """

    cursor = conn.execute(sql, tuple(params))
    rows = cursor.fetchall()
    return sqlresult_to_dictlist(rows, cursor.description)


@router.get("")
def get_games(
    filter_query: Annotated[FilterParams, Query()],
    session_id: Optional[str] = Cookie(None),
):
    if filter_query.search is not None:
        with get_dbconn() as conn:
            return _search_games(conn, filter_query.search)

    # Destructure search params
    genres = filter_query.genres
    platforms = filter_query.platforms
    page = filter_query.page
    size = filter_query.size
    sort_by = filter_query.sort
    order_by = filter_query.order
    owned = filter_query.owned
    user_id = extract_access_token(session_id)

    conditions = []
    params = {
        "page": page,
        "size": size,
    }
    condition_string = ""
    owned_status_query = "0"

    if genres is not None:
        genres = genres if isinstance(genres, list) else [genres]
        kv = {f"genre{int(i)}": genre for i, genre in enumerate(genres)}
        placeholder = ", ".join([f":{key}" for key in kv.keys()])
        params.update(kv)
        conditions.append(
            f"""
            EXISTS (
                SELECT 1 FROM game_genres
                WHERE game_id = id AND genre_id IN ({placeholder}))
            """
        )

    if platforms is not None:
        platforms = platforms if isinstance(platforms, list) else [platforms]
        kv = {f"platform{int(i)}": platform for i, platform in enumerate(platforms)}
        placeholder = ", ".join([f":{key}" for key in kv.keys()])
        params.update(kv)
        conditions.append(
            f"""
            EXISTS (
                SELECT 1 FROM game_platforms
                WHERE game_id = id AND platform_id IN ({placeholder}))
            """
        )

    if owned and user_id is not None:
        conditions.append(
            """
            id IN (
                SELECT game_id FROM game_users
                WHERE user_id = :user_id)
            """
        )
        params.update({"user_id": user_id})

    if user_id is not None:
        user_id = int(user_id)
        params.update({"user_id": user_id})
        owned_status_query = """
            id IN (SELECT game_id FROM game_users WHERE user_id = :user_id)
            """
        if owned:
            conditions.append(owned_status_query)

    condition_string = (" WHERE " + "AND".join(conditions)) if conditions else ""
    query = f"""
        SELECT
            id, name, price, introduction, landscape, release_date, rating,
            ({owned_status_query}) AS owned,
            (SELECT GROUP_CONCAT(genre_id, '_')
                FROM (SELECT genre_id
                    FROM game_genres
                    WHERE game_id = id
                    ORDER BY weight DESC
                    LIMIT 5)) genre_ids,
            (SELECT GROUP_CONCAT(platform_id, '_')
                FROM game_platforms
                WHERE game_id = id) platform_ids
            FROM games
            {condition_string}
            ORDER BY {sort_by} {order_by}
            LIMIT :size
            OFFSET ((:page - 1) * :size)
        """

    with get_dbconn() as conn:
        cursor = conn.execute(query, params)
        games_rs = cursor.fetchall()
        games = sqlresult_to_dictlist(games_rs, cursor.description)

    return games


@router.get("/{game_id}")
def get_game(game_id: int, session_id: Optional[str] = Cookie(None)):
    conn = get_dbconn()
    user_id = extract_access_token(session_id)

    # ---- Game
    cursor = conn.execute(
        """
        SELECT id, name, price, introduction, description, developer, publisher, portrait, landscape, background, release_date, rater_count, rating
        FROM games
        WHERE id = :game_id
        """,
        {"game_id": game_id},
    )
    game_rs = cursor.fetchone()
    if game_rs is None:
        raise HTTPException(status_code=404, detail="Game not found")
    game = sqlresult_to_dict(game_rs, cursor.description)

    # ---- Genres
    cursor = conn.execute(
        """
        SELECT id, name, icon
        FROM genres
        JOIN game_genres gr ON gr.genre_id = id
        WHERE gr.game_id = :game_id
        ORDER BY gr.weight DESC
        """,
        {"game_id": game_id},
    )
    genres_rs = cursor.fetchall()
    genres = sqlresult_to_dictlist(genres_rs, cursor.description)

    # ---- Platforms
    cursor = conn.execute(
        """
        SELECT id, name, value, min_requirements, rec_requirements
        FROM platforms
        JOIN game_platforms ON platform_id = id
        WHERE game_id = :game_id
        """,
        {"game_id": game_id},
    )
    platforms_rs = cursor.fetchall()
    platforms = sqlresult_to_dictlist(platforms_rs, cursor.description)

    # ---- Screenshots
    cursor = conn.execute(
        """
        SELECT id, thumbnail, content
        FROM screenshots
        WHERE game_id = :game_id
        """,
        {"game_id": game_id},
    )
    screenshots_rs = cursor.fetchall()
    screenshots = sqlresult_to_dictlist(screenshots_rs, cursor.description)

    # ---- Movies
    cursor = conn.execute(
        """
        SELECT id, thumbnail, content_sd, content_max
        FROM movies
        WHERE game_id = :game_id
        """,
        {"game_id": game_id},
    )
    movies_rs = cursor.fetchall()
    movies = sqlresult_to_dictlist(movies_rs, cursor.description)

    # ---- Achievements
    cursor = conn.execute(
        """
        SELECT id, name, thumbnail
        FROM achievements
        WHERE game_id = :game_id
        """,
        {"game_id": game_id},
    )
    achievements_rs = cursor.fetchall()
    achievements = sqlresult_to_dictlist(achievements_rs, cursor.description)

    game_data = {
        **game,
        "genres": genres,
        "platforms": platforms,
        "screenshots": screenshots,
        "movies": movies,
        "achievements": achievements,
    }
    # ---- User stars
    if user_id is not None:
        cursor = conn.execute(
            """
            SELECT stars, owned_at
            FROM game_users
            WHERE game_id = :game_id AND user_id = :user_id
            """,
            {"game_id": game_id, "user_id": user_id},
        )
        owned_rs = cursor.fetchone()
        if owned_rs is not None:
            owned = sqlresult_to_dict(owned_rs, cursor.description)
            game_data.update({"owned": owned})

    return game_data


@router.patch("/{game_id}/ratings")
def rate_game(game_id: int, body: GameRate, session_id: Optional[str] = Cookie(None)):
    user_id = extract_access_token(session_id)
    if user_id is None:
        raise HTTPException(status_code=401)

    params = {"game_id": game_id, "user_id": user_id, "stars": body.stars}

    with get_dbconn() as conn:
        cursor = conn.execute(
            """
            UPDATE game_users
            SET stars = :stars
            WHERE user_id = :user_id AND game_id = :game_id
            """,
            params,
        )

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=409,
                detail="Need to purchase before rating",
            )

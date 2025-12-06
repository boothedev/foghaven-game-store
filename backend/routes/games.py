from flask import Blueprint, jsonify, request, session
from sqlalchemy import text

from haven import db

games_bp = Blueprint("games", __name__)


def _search_games(search: str):
    # Split keywords and use wildcard matches with SQLite concatenation
    keywords = search.split()
    if not keywords:
        return []

    where_clauses = []
    params = []
    for kw in keywords:
        where_clauses.append("name LIKE ?")
        params.append(f"%{kw}%")

    sql = text(f"""
    SELECT id, name, price, landscape, release_date, rating
    FROM games
    WHERE {" AND ".join(where_clauses)}
    ORDER BY rater_count
    LIMIT 5
    """)

    cursor = db.session.execute(sql, tuple(params))
    rows = cursor.fetchall()
    return jsonify([dict(r._mapping) for r in rows])


@games_bp.get("/games")
def get_games():
    # Check if is game search request
    search = request.args.get("search")

    if search:
        return _search_games(search)

    # Normal game filter route
    user_id = session.get("user_id")
    page = int(request.args.get("page", 1))
    size = int(request.args.get("size", 50))
    genres = [int(genre) for genre in request.args.getlist("genres")]
    platforms = [int(platform) for platform in request.args.getlist("platforms")]
    sort_by = request.args.get("sort")
    order_by = request.args.get("order")
    owned = request.args.get("owned")
    offset = (page - 1) * size

    conditions = []
    params = {
        "offset": offset,
        "size": size,
    }
    owned_status_query = "0"

    if genres:
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

    if platforms:
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

    if owned and user_id:
        conditions.append(
            """
            id IN (
                SELECT game_id FROM game_users
                WHERE user_id = :user_id)
            """
        )
        params.update({"user_id": user_id})

    if user_id:
        user_id = int(user_id)
        params.update({"user_id": user_id})
        owned_status_query = """
            id IN (SELECT game_id FROM game_users WHERE user_id = :user_id)
            """
        if owned:
            conditions.append(owned_status_query)

    condition_string = (" WHERE " + " AND ".join(conditions)) if conditions else ""

    sql = text(f"""
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
            OFFSET :offset)
    """)

    rows = db.session.execute(sql, params).fetchall()

    return jsonify([dict(r._mapping) for r in rows])


@games_bp.get("/games/<int:game_id>")
def get_game_by_id(game_id):
    user_id = session.get("user_id")
    game = db.session.execute(
        text("""
            SELECT id, name, price, introduction, landscape, release_date, rating
            FROM games
            WHERE id = :gid
        """),
        {"gid": game_id},
    ).fetchone()

    if not game:
        return jsonify({"detail": "Game not found"}), 404

    game_data = dict(game._mapping)

    platforms = db.session.execute(
        text("""
            SELECT p.id, p.name, p.value, p.weight
            FROM platforms p
            JOIN game_platforms gp ON gp.platform_id = p.id
            WHERE gp.game_id = :gid
            ORDER BY p.weight DESC
        """),
        {"gid": game_id},
    ).fetchall()

    game_data["platforms"] = [dict(p._mapping) for p in platforms]

    genres = db.session.execute(
        text("""
            SELECT g.id, g.name, g.icon, g.weight
            FROM genres g
            JOIN game_genres gg ON gg.genre_id = g.id
            WHERE gg.game_id = :gid
            ORDER BY g.weight DESC
        """),
        {"gid": game_id},
    ).fetchall()

    game_data["genres"] = [dict(g._mapping) for g in genres]

    # ---- Screenshots
    screenshots = db.session.execute(
        text(
            """
        SELECT id, thumbnail, content
        FROM screenshots
        WHERE game_id = :game_id
        """
        ),
        {"game_id": game_id},
    ).fetchall()
    game_data["screenshots"] = [dict(s._mapping) for s in screenshots]

    # ---- Movies
    movies = db.session.execute(
        text(
            """
        SELECT id, thumbnail, content_sd, content_max
        FROM movies
        WHERE game_id = :game_id
        """
        ),
        {"game_id": game_id},
    ).fetchall()
    game_data["movies"] = [dict(m._mapping) for m in movies]

    # ---- Achievements
    achievements = db.session.execute(
        text(
            """
        SELECT id, name, thumbnail
        FROM achievements
        WHERE game_id = :game_id
        """
        ),
        {"game_id": game_id},
    ).fetchall()
    game_data["achievements"] = [dict(a._mapping) for a in achievements]

    # ---- User stars
    if user_id:
        owned = db.session.execute(
            text(
                """
            SELECT stars, owned_at
            FROM game_users
            WHERE game_id = :game_id AND user_id = :user_id
            """
            ),
            {"game_id": game_id, "user_id": user_id},
        )
        if owned:
            game_data["owned"] = True

    return jsonify(game_data)


@games_bp.patch("/games/<int:game_id>/ratings")
def update_rating(game_id):
    data = request.json

    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"detail": "Not logged in"}), 401

    stars = data.get("stars")
    if stars is None and (stars < 1 or stars > 5):
        return jsonify({"detail": "Stars must be between 1 and 5"}), 400

    rs = db.session.execute(
        text("""
            UPDATE game_users
            SET stars = :stars
            WHERE game_id = :gid AND user_id = :uid
        """),
        {"stars": stars, "gid": game_id, "uid": user_id},
    )
    db.session.commit()

    if rs:
        return jsonify({"detail": "Buy the game first"}), 409

    return jsonify(None), 200

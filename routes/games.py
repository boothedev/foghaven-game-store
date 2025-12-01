from flask import Blueprint, request, session, jsonify
from haven import db
from sqlalchemy import text


games_bp = Blueprint("games", __name__)

@games_bp.get("/games")
def get_games():
    page = int(request.args.get("page", 1))
    size = int(request.args.get("size", 50))
    offset = (page - 1) * size

    sql = text("""
        SELECT id, name, price, introduction, landscape, release_date, rating
        FROM games
        ORDER BY rater_count DESC
        LIMIT :size
        OFFSET :offset
    """)

    rows = db.session.execute(sql, {"size": size, "offset": offset}).fetchall()

    return jsonify([dict(r._mapping) for r in rows])


@games_bp.get("/games/<int:game_id>")
def get_game_by_id(game_id):
    game = db.session.execute(
        text("""
            SELECT id, name, price, introduction, landscape, release_date, rating
            FROM games
            WHERE id = :gid
        """),
        {"gid": game_id}
    ).fetchone()

    if not game:
        return jsonify({"error": "Game not found"}), 404

    game_data = dict(game._mapping)

    platforms = db.session.execute(
        text("""
            SELECT p.id, p.name, p.value, p.weight
            FROM platforms p
            JOIN game_platforms gp ON gp.platform_id = p.id
            WHERE gp.game_id = :gid
            ORDER BY p.weight DESC
        """),
        {"gid": game_id}
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
        {"gid": game_id}
    ).fetchall()

    game_data["genres"] = [dict(g._mapping) for g in genres]

    return jsonify(game_data)

@games_bp.put("/games/<int:game_id>/ratings")
def update_rating(game_id):
    data = request.json

    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401

    stars = data.get("stars")
    if stars is None or stars < 1 or stars > 5:
        return jsonify({"error": "Stars must be between 1 and 5"}), 400
    owned = db.session.execute(
        text("""
            SELECT stars
            FROM game_users
            WHERE game_id = :gid AND user_id = :uid
        """),
        {"gid": game_id, "uid": user_id}
    ).fetchone()

    if not owned:
        return jsonify({"error": "User does not own this game"}), 400

    db.session.execute(
        text("""
            UPDATE game_users
            SET stars = :stars
            WHERE game_id = :gid AND user_id = :uid
        """),
        {"stars": stars, "gid": game_id, "uid": user_id}
    )

    agg = db.session.execute(
        text("""
            SELECT COUNT(stars) AS count, AVG(stars) AS avg
            FROM game_users
            WHERE game_id = :gid AND stars IS NOT NULL
        """),
        {"gid": game_id}
    ).fetchone()

    new_count = agg.count or 0
    new_avg = agg.avg or 0

    db.session.execute(
        text("""
            UPDATE games
            SET rating = :avg, rater_count = :count
            WHERE id = :gid
        """),
        {"avg": new_avg, "count": new_count, "gid": game_id}
    )

    db.session.commit()

    return jsonify({
        "game_id": game_id,
        "user_id": user_id,
        "stars": stars
    })
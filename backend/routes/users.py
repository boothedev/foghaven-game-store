from flask import Blueprint, jsonify, request, session
from sqlalchemy import text

from haven import db

from .auth import get_password_hash, verify_password

users_bp = Blueprint("users", __name__)


@users_bp.get("/currentuser")
def get_current_user():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"logged_in": False, "user": None})

    user = db.session.execute(
        text("""
            SELECT id, username, balance, (SELECT COUNT(*)
                            FROM game_users
                            WHERE user_id = id) AS owned
            FROM users
            WHERE id = :uid
        """),
        {"uid": user_id},
    ).fetchone()

    if not user:
        return jsonify({"logged_in": False, "user": None})

    cards = db.session.execute(
        text("""
            SELECT id, name, number, exp_month, exp_year
            FROM payment_cards
            WHERE user_id = :uid
        """),
        {"uid": user_id},
    ).fetchall()

    return jsonify(
        {
            **dict(user._mapping),
            "cards": [dict(c._mapping) for c in cards],
        }
    )


@users_bp.patch("/currentuser")
def update_current_user():
    user_id = session.get("user_id")
    data = request.json
    new_username = data.get("new_username")
    new_password = data.get("new_password")
    current_password = data.get("current_password")
    topup = data.get("topup")

    if user_id is None:
        return jsonify({"detail": "unauthorized"}), 401

    params = {
        "user_id": user_id,
    }

    # Verify password
    rs = db.session.execute(
        text(
            """
        SELECT password
        FROM users
        WHERE id = :user_id
        """
        ),
        params,
    ).fetchone()
    if not rs:
        return jsonify(None), 404
    current_password_hash = rs.password
    if not verify_password(current_password, current_password_hash):
        return jsonify({"detail": "Invalid password"}), 401

    ## Collect updates
    update_queries = []

    # New username
    if new_username is not None:
        update_queries.append("username = :new_username")
        params.update({"new_username": new_username})

    # New password
    if new_password is not None:
        update_queries.append("password = :new_password")
        params.update({"new_password": get_password_hash(new_password)})

    # Topup balance
    if topup is not None:
        update_queries.append("balance = balance + :topup")
        params.update({"topup": topup})

    # Combine
    if not update_queries:
        return jsonify({"detail": "Nothing to update"}), 400
    update_fragment = ",".join(update_queries)

    ## Process updates
    try:
        rs = db.session.execute(
            text(f"""
            UPDATE users
            SET {update_fragment}
            WHERE id = :user_id
            """),
            params,
        )
    except Exception:
        return jsonify({"detail": "Username already exists"}), 409

    if not rs:
        return jsonify({"detail": "Invalid password"}), 401

    db.session.commit()
    return jsonify(None), 200

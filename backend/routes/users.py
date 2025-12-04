from flask import Blueprint, jsonify, session
from haven import db
from sqlalchemy import text

users_bp = Blueprint("users", __name__)

@users_bp.get("/users/me")
def get_current_user():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"logged_in": False, "user": None})

    user = db.session.execute(
        text("""
            SELECT id, username, balance
            FROM users
            WHERE id = :uid
        """),
        {"uid": user_id}
    ).fetchone()

    if not user:
        return jsonify({"logged_in": False, "user": None})

    cards = db.session.execute(
        text("""
            SELECT id, number, exp_month, exp_year
            FROM payment_cards
            WHERE user_id = :uid
        """),
        {"uid": user_id}
    ).fetchall()

    return jsonify({
        "logged_in": True,
        "user": {
            "id": user.id,
            "username": user.username,
            "balance": user.balance,
            "cards": [dict(c._mapping) for c in cards]
        }
    })

from flask import Blueprint, jsonify, request, session
from sqlalchemy import text

from haven import db

orders_bp = Blueprint("orders", __name__)


@orders_bp.post("/orders")
def create_order():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"detail": "Not logged in"}), 401

    data = request.json
    game_id = data.get("game_id")

    rs = db.session.execute(
        text("""
            UPDATE users
            SET balance = balance - (SELECT price from games g WHERE g.id = :game_id)
            WHERE id = :uid AND balance >= (SELECT price from games g WHERE g.id = :game_id)
        """),
        {"uid": user_id, "gid": game_id},
    )

    if not rs:
        db.session.rollback()
        return jsonify({"detail": "Insufficient Funds"}), 402

    rs = db.session.execute(
        text("""
            INSERT INTO game_users (game_id, user_id, owned_at)
            VALUES (:gid, :uid, DATETIME('now'))
        """),
        {"gid": game_id, "uid": user_id},
    )

    if not rs:
        db.session.rollback()
        return jsonify({"detail": "Already purchased"}), 409

    db.session.commit()

    return jsonify({"message": "Order completed"})

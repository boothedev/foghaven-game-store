from flask import Blueprint, request, jsonify
from haven import db
from sqlalchemy import text

orders_bp = Blueprint("orders", __name__)


@orders_bp.post("/orders")
def buy_game():
    data = request.json

    user_id = data.get("user_id")
    game_id = data.get("game_id")
    price = data.get("price")

    balance = db.session.execute(
        text("SELECT balance FROM users WHERE id = :uid"),
        {"uid": user_id}
    ).fetchone()

    if not balance:
        return jsonify({"error": "User not found"}), 404

    if balance.balance < price:
        return jsonify({"error": "Insufficient balance"}), 400

    db.session.execute(
        text("""
            UPDATE users
            SET balance = balance - :price
            WHERE id = :uid
        """),
        {"price": price, "uid": user_id}
    )

    db.session.execute(
        text("""
            INSERT INTO game_users (game_id, user_id, stars, owned_at)
            VALUES (:gid, :uid, NULL, DATETIME('now'))
        """),
        {"gid": game_id, "uid": user_id}
    )

    db.session.commit()

    return jsonify({"message": "Game purchased!"})

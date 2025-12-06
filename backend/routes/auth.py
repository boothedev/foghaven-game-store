from flask import Blueprint, jsonify, request, session
from sqlalchemy import text
from werkzeug.security import check_password_hash, generate_password_hash

from haven import db

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    existing = db.session.execute(
        text("SELECT 1 FROM users WHERE username = :u"), {"u": username}
    ).fetchone()

    if existing:
        return jsonify({"detail": "Username already exists"}), 400

    hashed_password = generate_password_hash(password)

    db.session.execute(
        text("""
            INSERT INTO users (username, password, balance)
            VALUES (:u, :p, 0)
        """),
        {"u": username, "p": hashed_password},
    )
    db.session.commit()

    user = db.session.execute(
        text("SELECT id, username, balance FROM users WHERE username = :u"),
        {"u": username},
    ).fetchone()

    if not user:
        return jsonify(None), 404

    session["user_id"] = user.id

    return jsonify(
        {"id": user.id, "username": user.username, "balance": user.balance, "cards": []}
    ), 201


@auth_bp.post("/login")
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    user = db.session.execute(
        text("""
            SELECT id, username, password AS hashed, balance
            FROM users
            WHERE username = :u
        """),
        {"u": username},
    ).fetchone()

    if not user or not check_password_hash(user.hashed, password):
        return jsonify({"detail": "Invalid username or password"}), 401

    session["user_id"] = user.id

    return jsonify(None)


@auth_bp.get("/currentuser")
def current_user():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify(None), 401

    user = db.session.execute(
        text("SELECT id, username, balance FROM users WHERE id = :id"), {"id": user_id}
    ).fetchone()

    cards = db.session.execute(
        text("""
            SELECT id, number, exp_month, exp_year
            FROM payment_cards
            WHERE user_id = :uid
        """),
        {"uid": user_id},
    ).fetchall()

    if not user:
        return jsonify(None), 401

    return jsonify(
        {
            "id": user.id,
            "username": user.username,
            "balance": user.balance,
            "cards": [dict(c._mapping) for c in cards],
        }
    )


@auth_bp.post("/logout")
def logout():
    session.pop("user_id", None)
    return jsonify(None)

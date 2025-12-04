from flask import Blueprint, request, jsonify, session
from haven import db
from sqlalchemy import text
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    existing = db.session.execute(
        text("SELECT id FROM users WHERE username = :u"),
        {"u": username}
    ).fetchone()

    if existing:
        return jsonify({"error": "Username already exists"}), 400

    hashed_password = generate_password_hash(password)

    db.session.execute(
        text("""
            INSERT INTO users (username, password, balance)
            VALUES (:u, :p, 0)
        """),
        {"u": username, "p": hashed_password}
    )
    db.session.commit()

    user = db.session.execute(
        text("SELECT id, username, balance FROM users WHERE username = :u"),
        {"u": username}
    ).fetchone()

    session["user_id"] = user.id

    return jsonify({
        "id": user.id,
        "username": user.username,
        "balance": user.balance,
        "cards": []
    })


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
        {"u": username}
    ).fetchone()

    if not user or not check_password_hash(user.hashed, password):
        return jsonify({"error": "Invalid username or password"}), 401

    session["user_id"] = user.id

    cards = db.session.execute(
        text("""
            SELECT id, number, exp_month, exp_year
            FROM payment_cards
            WHERE user_id = :uid
        """),
        {"uid": user.id}
    ).fetchall()

    return jsonify({
        "id": user.id,
        "username": user.username,
        "balance": user.balance,
        "cards": [dict(c._mapping) for c in cards]
    })


@auth_bp.post("/logout")
def logout():
    session.pop("user_id", None)
    return jsonify({"message": "Logged out"})

@auth_bp.get("/currentuser")
def current_user():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify(None)

    user = db.session.execute(
        text("SELECT id, username, balance FROM users WHERE id = :id"),
        {"id": user_id}
    ).fetchone()

    cards = db.session.execute(
        text("""
            SELECT id, number, exp_month, exp_year
            FROM payment_cards
            WHERE user_id = :uid
        """),
        {"uid": user_id}
    ).fetchall()

    return jsonify({
        "id": user.id,
        "username": user.username,
        "balance": user.balance,
        "cards": [dict(c._mapping) for c in cards]
    })

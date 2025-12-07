from flask import Blueprint, jsonify, request, session
from pwdlib import PasswordHash
from sqlalchemy import text

from haven import db

password_hash = PasswordHash.recommended()


def verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)


def get_password_hash(password):
    return password_hash.hash(password)


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

    hashed_password = get_password_hash(password)

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

    if not user or not verify_password(password, user.hashed):
        return jsonify({"detail": "Invalid username or password"}), 401

    session["user_id"] = user.id

    return jsonify(None)


@auth_bp.post("/logout")
def logout():
    session.pop("user_id", None)
    return jsonify(None)

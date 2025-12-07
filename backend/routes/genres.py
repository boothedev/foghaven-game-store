from flask import Blueprint, jsonify
from sqlalchemy import text

from haven import db

genres_bp = Blueprint("genres", __name__)


@genres_bp.get("/genres")
def get_genres():
    rows = db.session.execute(
        text("SELECT id, name, icon, weight FROM genres ORDER BY weight DESC")
    ).fetchall()

    return jsonify([dict(r._mapping) for r in rows])

from flask import Blueprint, jsonify
from sqlalchemy import text

from haven import db

platforms_bp = Blueprint("platforms", __name__)


@platforms_bp.get("/platforms")
def get_platforms():
    rows = db.session.execute(
        text("SELECT id, name, value, weight FROM platforms ORDER BY weight DESC")
    ).fetchall()

    return jsonify([dict(r._mapping) for r in rows])

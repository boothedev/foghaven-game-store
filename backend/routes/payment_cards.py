from flask import Blueprint, request, session, jsonify
from haven import db
from sqlalchemy import text

cards_bp = Blueprint("cards", __name__)


@cards_bp.get("/payment_cards")
def get_cards():
    user_id = session.get("user_id")
    
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401
    
    rows = db.session.execute(
        text("""
            SELECT id, number, exp_month, exp_year
            FROM payment_cards
            WHERE user_id = :uid
        """),
        {"uid": user_id}
    ).fetchall()

    return jsonify([dict(r._mapping) for r in rows])


@cards_bp.post("/payment_cards")
def add_card():

    user_id = session.get("user_id")
    data = request.json

    name = data.get("name")
    number = data.get("number")
    exp_month = data.get("exp_month")
    exp_year = data.get("exp_year")
    security = data.get("security")

    db.session.execute(
        text("""
            INSERT INTO payment_cards (user_id, name, number, exp_month, exp_year, security_code)
            VALUES (:uid, :name, :number, :month, :year, :sec)
        """),
        {
            "uid": user_id,
            "name": name,
            "number": number,
            "month": exp_month,
            "year": exp_year,
            "sec": security
        }
    )
    db.session.commit()

    return jsonify({"message": "Card added"})

@cards_bp.delete("/payment_cards/<int:card_id>")
def delete_card(card_id):
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401

    db.session.execute(
        text("""
            DELETE FROM payment_cards
            WHERE id = :cid AND user_id = :uid
        """),
        {"cid": card_id, "uid": user_id}
    )
    db.session.commit()

    return jsonify({"message": "Payment card removed"})

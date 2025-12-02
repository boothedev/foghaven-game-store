from typing import Optional
from fastapi import APIRouter, HTTPException, Cookie

from app.utils.authenticate import extract_access_token
from ..db import get_dbconn
from ..schemas import PaymentCard
from fastapi import status

router = APIRouter(prefix="/api/payment_cards")


@router.post("")
def add_payment_card(card: PaymentCard, session_id: Optional[str] = Cookie(None)):
    user_id = extract_access_token(session_id)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    params = {**card.__dict__, "user_id": user_id}

    with get_dbconn() as conn:
        cursor = conn.execute(
            """
            INSERT INTO payment_cards (user_id,name,number,exp_month,exp_year,security_code)
            VALUES (:user_id,:name,:number,:exp_month,:exp_year,:security_code)
            """,
            params,
        )

        if cursor.rowcount == 0:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)


@router.delete("/{card_id}")
def remove_payment_card(card_id: int, session_id: Optional[str] = Cookie(None)):
    user_id = extract_access_token(session_id)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    with get_dbconn() as conn:
        cursor = conn.execute(
            """
            DELETE FROM payment_cards
            WHERE id = :card_id AND user_id = :user_id
            """,
            {
                "card_id": card_id,
                "user_id": user_id,
            },
        )

        if cursor.rowcount == 0:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

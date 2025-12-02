from fastapi import APIRouter, HTTPException, Cookie
from typing import Optional

from app.utils.authenticate import extract_access_token
from ..db import get_dbconn
from ..schemas import GamesPurchase
from fastapi import status

router = APIRouter(prefix="/api/orders")


@router.post("")
def purchase_games(games: GamesPurchase, session_id: Optional[str] = Cookie(None)):
    user_id = extract_access_token(session_id)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    params = {"game_id": games.id, "user_id": user_id}

    with get_dbconn() as conn:
        cursor = conn.execute(
            """
            UPDATE users
            SET balance = balance - (SELECT price from games g WHERE g.id = :game_id)
            WHERE id = :user_id
            RETURNING balance
            """,
            params,
        )
        after_balance = cursor.fetchone()

        if after_balance is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        if after_balance[0] < 0:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Insufficient Funds",
            )

        cursor = conn.execute(
            """
            INSERT OR IGNORE INTO game_users (user_id, game_id, owned_at)
            VALUES (:user_id,:game_id,DATETIME('now'))
            """,
            params,
        )

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Already purchased"
            )

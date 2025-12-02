from typing import Optional
from fastapi import APIRouter, HTTPException, Cookie

from app.utils.authenticate import extract_access_token
from ..db import get_dbconn
from ..schemas import UserUpdate
from ..utils.sqlresult import sqlresult_to_dictlist, sqlresult_to_dict
from fastapi import status

router = APIRouter(prefix="/api")


@router.patch("/currentuser")
def update_current_user(body: UserUpdate, session_id: Optional[str] = Cookie(None)):
    user_id = extract_access_token(session_id)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    params = {
        "user_id": user_id,
        "current_password": body.current_password,
    }

    update_queries = []

    # New username
    if body.new_username is not None:
        update_queries.append("username = :new_username")
        params.update({"new_username": body.new_username})

    # New password
    if body.new_password is not None:
        update_queries.append("password = :new_password")
        params.update({"new_password": body.new_password})

    # Topup balance
    if body.topup is not None:
        update_queries.append("balance = balance + :topup")
        params.update({"topup": body.topup})

    # Combine
    if not update_queries:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Nothing to update"
        )
    update_fragment = ",".join(update_queries)

    with get_dbconn() as conn:
        try:
            cursor = conn.execute(
                f"""
                UPDATE users
                SET {update_fragment}
                WHERE id = :user_id AND password = :current_password
                """,
                params,
            )
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Username already exists"
            )

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password"
            )

        conn.commit()


@router.get("/currentuser")
def get_current_user(session_id: Optional[str] = Cookie(None)):
    user_id = extract_access_token(session_id)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    with get_dbconn() as conn:
        cursor = conn.execute(
            """
            SELECT username, balance,
                (SELECT COUNT(*)
                FROM game_users
                WHERE user_id = id) AS owned
            FROM users WHERE id = ?
            """,
            (user_id,),
        )

        user_rs = cursor.fetchone()

        if not user_rs:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        user = sqlresult_to_dict(user_rs, cursor.description)

        cursor = conn.execute(
            """
            SELECT id, name, number, exp_month, exp_year FROM payment_cards WHERE user_id = ? ORDER BY id DESC
            """,
            (user_id,),
        )
        cards_rs = cursor.fetchall()

        cards = sqlresult_to_dictlist(cards_rs, cursor.description)

    return {**user, "cards": cards}

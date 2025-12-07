from typing import Any, Optional

from fastapi import APIRouter, Cookie, HTTPException, Response, status

from app.db import get_dbconn
from app.schemas import UserUpdate
from app.utils.authenticate import COOKIE_SESSION, extract_access_token
from app.utils.hashing import get_password_hash, verify_password
from app.utils.sqlresult import sqlresult_to_dict, sqlresult_to_dictlist

router = APIRouter()


@router.patch("/currentuser")
def update_current_user(body: UserUpdate, session_id: Optional[str] = Cookie(None)):
    user_id = extract_access_token(session_id)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    params: dict[str, Any] = {
        "user_id": user_id,
    }

    # Verify password
    with get_dbconn() as conn:
        (current_password_hash,) = conn.execute(
            """
            SELECT password
            WHERE id = :user_id
            """,
            params,
        ).fetchone()
        if not verify_password(body.current_password, current_password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password"
            )

    ## Collect updates
    update_queries = []

    # New username
    if body.new_username is not None:
        update_queries.append("username = :new_username")
        params.update({"new_username": body.new_username})

    # New password
    if body.new_password is not None:
        update_queries.append("password = :new_password")
        params.update({"new_password": get_password_hash(body.new_password)})

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

    ## Process updates
    with get_dbconn() as conn:
        try:
            cursor = conn.execute(
                f"""
                UPDATE users
                SET {update_fragment}
                WHERE id = :user_id
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
def get_current_user(response: Response, session_id: Optional[str] = Cookie(None)):
    user_id = extract_access_token(session_id)
    if user_id is None:
        response.delete_cookie(COOKIE_SESSION)
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

from typing import Optional

from fastapi import APIRouter, HTTPException, Response, status

from app.db import get_dbconn
from app.schemas import UserAuth
from app.utils.authenticate import (
    ACCESS_TOKEN_EXPIRE_SECOND,
    ACCESS_TOKEN_EXPIRE_SECOND_TMP,
    COOKIE_SESSION,
    create_access_token,
)
from app.utils.hashing import get_password_hash, verify_password

router = APIRouter()


@router.post("/login")
def login(body: UserAuth, response: Response):
    username = body.username
    password = body.password
    remember = body.remember

    with get_dbconn() as conn:
        result: Optional[tuple[int, str]] = conn.execute(
            """
            SELECT id, password FROM users WHERE username = ?
            """,
            (username,),
        ).fetchone()

    if result:
        (_, hashed_password) = result
        result = result if verify_password(password, hashed_password) else None

    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username or password is incorrect",
        )

    (user_id, _) = result
    max_age = ACCESS_TOKEN_EXPIRE_SECOND if remember else ACCESS_TOKEN_EXPIRE_SECOND_TMP
    token = create_access_token({"user_id": user_id}, max_age)
    response.set_cookie(COOKIE_SESSION, token, max_age=max_age)


@router.post("/register")
def register(body: UserAuth):
    username = body.username
    password = get_password_hash(body.password)

    try:
        with get_dbconn() as conn:
            conn.execute(
                """
                INSERT INTO users(username, password) VALUES(?,?)
                """,
                (username, password),
            )
            conn.commit()
    except Exception:
        # Keep the behavior similar to previous code: treat integrity errors as conflict
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Username already exists"
        )


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(COOKIE_SESSION)

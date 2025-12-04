from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt

COOKIE_SESSION = "session_id"
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_SECOND_TMP = 15 * 60
ACCESS_TOKEN_EXPIRE_SECOND = 24 * 60 * 60


def create_access_token(data: dict, expires_delta: int):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(seconds=expires_delta)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def extract_access_token(token: Optional[str]):
    if token is None:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return int(payload["user_id"])
    except Exception:
        return None

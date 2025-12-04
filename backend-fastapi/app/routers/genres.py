from fastapi import APIRouter

from ..db import get_dbconn
from ..utils.sqlresult import sqlresult_to_dictlist

router = APIRouter(prefix="/api/genres")


@router.get("")
def get_genres():
    with get_dbconn() as conn:
        cursor = conn.execute(
            """
            SELECT id, name, icon
            FROM genres
            ORDER BY weight DESC
            """
        )
        result = cursor.fetchall()

        genre_list = sqlresult_to_dictlist(result, cursor.description)

    return genre_list

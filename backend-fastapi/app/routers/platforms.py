from fastapi import APIRouter

from ..db import get_dbconn
from ..utils.sqlresult import sqlresult_to_dictlist

router = APIRouter(prefix="/api/platforms")


@router.get("")
def get_platforms():
    with get_dbconn() as conn:
        cursor = conn.execute(
            """
            SELECT id, name, value
            FROM platforms
            """
        )
        result = cursor.fetchall()

    platform_list = sqlresult_to_dictlist(result, cursor.description)

    return platform_list

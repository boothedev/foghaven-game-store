import os
import sqlite3

# BASE_DIR = os.path.dirname(os.path.abspath(__))
VOLUMN_DIR = os.getenv("VOLUMN_DIR", "")
DB_PATH = os.path.join(VOLUMN_DIR, "haven.db")


def get_dbconn():
    """Return a sqlite3 connection to the app database.

    Uses an explicit path so the DB file is resolved relative to the `app` package.
    """
    return sqlite3.connect(DB_PATH)

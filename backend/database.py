from __future__ import annotations

import sqlite3
from contextlib import contextmanager
import os
from pathlib import Path
from typing import Any, Generator

BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH_ENV = os.environ.get("DATABASE_PATH")
if DATABASE_PATH_ENV:
    DATABASE_PATH = Path(DATABASE_PATH_ENV)
    DATA_DIR = DATABASE_PATH.parent
else:
    DATA_DIR = BASE_DIR / "data"
    DATABASE_PATH = DATA_DIR / "volunteers.db"


@contextmanager
def get_connection() -> Generator[sqlite3.Connection, None, None]:
    """Create a SQLite connection with row dictionaries enabled and automatic closing."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    try:
        with connection:
            yield connection
    finally:
        connection.close()


def initialize_database() -> None:
    """Create required tables and indexes if this is the first run."""
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS volunteers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                role TEXT NOT NULL,
                duration TEXT NOT NULL,
                join_date TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Active'
            )
            """
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_volunteers_name ON volunteers(name)"
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_volunteers_role ON volunteers(role)"
        )
        connection.commit()


def row_to_dict(row: sqlite3.Row | None) -> dict[str, Any] | None:
    if row is None:
        return None
    return dict(row)

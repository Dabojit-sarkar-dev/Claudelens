#!/usr/bin/env python3
"""Seed the ClauseLens database (same data as POST /v1/dev/seed)."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.db.models import SessionLocal, init_db
from app.services.seed import SEED_PASSWORD, run_seed


def main() -> None:
    init_db()
    db = SessionLocal()
    try:
        result = run_seed(db)
        print("Seed complete.")
        print(f"  workspace_id: {result['workspace_id']}")
        print(f"  users: {', '.join(result['user_emails'])}")
        print(f"  password: {SEED_PASSWORD}")
        print(f"  documents: {', '.join(result['document_ids'])}")
    finally:
        db.close()


if __name__ == "__main__":
    main()

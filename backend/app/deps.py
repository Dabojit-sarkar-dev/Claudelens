from typing import List, Optional

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.auth import decode_token, get_user_by_id
from app.db.models import UserORM, WorkspaceMemberORM, get_db
from app.errors import api_error


async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> UserORM:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise api_error(401, "UNAUTHORIZED", "Missing or invalid Authorization header")
    token = authorization.split(" ", 1)[1]
    user_id = decode_token(token)
    user = get_user_by_id(db, user_id)
    if not user:
        raise api_error(401, "UNAUTHORIZED", "User not found")
    return user


def user_workspace_ids(db: Session, user_id: str) -> List[str]:
    rows = db.query(WorkspaceMemberORM.workspace_id).filter(WorkspaceMemberORM.user_id == user_id).all()
    return [r[0] for r in rows]


def ensure_document_access(db: Session, user: UserORM, document_id: str):
    from app.db.models import DocumentORM

    doc = db.query(DocumentORM).filter(DocumentORM.id == document_id).first()
    if not doc:
        raise api_error(404, "NOT_FOUND", "Contract not found")
    allowed = user_workspace_ids(db, user.id)
    if doc.workspace_id not in allowed:
        raise api_error(403, "FORBIDDEN", "You do not have access to this workspace")
    return doc

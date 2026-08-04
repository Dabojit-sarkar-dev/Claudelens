from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.models import UserORM, WorkspaceMemberORM, WorkspaceORM, get_db
from app.deps import get_current_user
from app.schemas import Workspace

router = APIRouter()


@router.get("", response_model=list[Workspace])
def list_workspaces(
    user: UserORM = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Workspace]:
    ids = [
        m.workspace_id
        for m in db.query(WorkspaceMemberORM).filter(WorkspaceMemberORM.user_id == user.id).all()
    ]
    if not ids:
        return []
    rows = db.query(WorkspaceORM).filter(WorkspaceORM.id.in_(ids)).order_by(WorkspaceORM.name).all()
    return [
        Workspace(id=w.id, name=w.name, slug=w.slug, created_at=w.created_at)
        for w in rows
    ]

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import authenticate_user, create_access_token
from app.db.models import UserORM, WorkspaceMemberORM, get_db
from app.deps import get_current_user
from app.errors import api_error
from app.schemas import LoginRequest, TokenResponse, UserMe

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = authenticate_user(db, body.email, body.password)
    if not user:
        raise api_error(401, "UNAUTHORIZED", "Invalid email or password")
    token = create_access_token(user.id)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserMe)
def me(user: UserORM = Depends(get_current_user), db: Session = Depends(get_db)) -> UserMe:
    workspace_ids = [
        m.workspace_id
        for m in db.query(WorkspaceMemberORM).filter(WorkspaceMemberORM.user_id == user.id).all()
    ]
    return UserMe(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        workspace_ids=workspace_ids,
    )

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import authenticate_user, create_access_token, hash_password
from app.db.models import UserORM, WorkspaceMemberORM, WorkspaceORM, get_db, new_id
from app.deps import get_current_user
from app.errors import api_error
from app.schemas import LoginRequest, OAuthLoginRequest, SignupRequest, TokenResponse, UserMe

router = APIRouter()


def create_personal_workspace(db: Session, user: UserORM) -> WorkspaceORM:
    ws_id = new_id("ws")
    slug = f"user-{user.id.lower()[:12]}"
    ws = WorkspaceORM(
        id=ws_id,
        name=f"{user.full_name}'s Workspace" if user.full_name else "Personal Workspace",
        slug=slug,
    )
    member = WorkspaceMemberORM(
        id=new_id("wm"),
        workspace_id=ws_id,
        user_id=user.id,
        role="owner",
    )
    db.add(ws)
    db.add(member)
    db.commit()
    db.refresh(ws)
    return ws


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = authenticate_user(db, body.email.strip().lower(), body.password)
    if not user:
        raise api_error(401, "UNAUTHORIZED", "Invalid email or password")
    token = create_access_token(user.id)
    return TokenResponse(access_token=token)


@router.post("/signup", response_model=TokenResponse)
def signup(body: SignupRequest, db: Session = Depends(get_db)) -> TokenResponse:
    email_clean = body.email.strip().lower()
    existing = db.query(UserORM).filter(UserORM.email == email_clean).first()
    if existing:
        raise api_error(400, "BAD_REQUEST", "User with this email already exists")

    user_id = new_id("usr")
    user = UserORM(
        id=user_id,
        email=email_clean,
        hashed_password=hash_password(body.password),
        full_name=body.full_name.strip(),
        role="reviewer",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    create_personal_workspace(db, user)

    token = create_access_token(user.id)
    return TokenResponse(access_token=token)


@router.post("/oauth", response_model=TokenResponse)
def oauth_login(body: OAuthLoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    email_clean = body.email.strip().lower()
    user = db.query(UserORM).filter(UserORM.email == email_clean).first()

    if not user:
        user_id = new_id("usr")
        full_name = body.full_name or email_clean.split("@")[0].capitalize()
        user = UserORM(
            id=user_id,
            email=email_clean,
            hashed_password=hash_password("OAuthSecretAccount!"),
            full_name=full_name,
            role="reviewer",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        create_personal_workspace(db, user)

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

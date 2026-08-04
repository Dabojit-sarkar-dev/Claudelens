from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.models import UserORM
from app.errors import api_error

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
settings = get_settings()


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decode_token(token: str) -> str:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        sub = payload.get("sub")
        if not sub:
            raise api_error(401, "UNAUTHORIZED", "Invalid token")
        return str(sub)
    except JWTError as exc:
        raise api_error(401, "UNAUTHORIZED", "Invalid or expired token") from exc


def authenticate_user(db: Session, email: str, password: str) -> Optional[UserORM]:
    user = db.query(UserORM).filter(UserORM.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def get_user_by_id(db: Session, user_id: str) -> Optional[UserORM]:
    return db.query(UserORM).filter(UserORM.id == user_id).first()

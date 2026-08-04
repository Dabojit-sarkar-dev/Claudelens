from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.models import get_db
from app.schemas import SeedResponse
from app.services.seed import run_seed

router = APIRouter()


@router.post("/seed", response_model=SeedResponse)
def seed_database(db: Session = Depends(get_db)) -> SeedResponse:
    result = run_seed(db)
    return SeedResponse(
        message="Database seeded with demo workspace, users, contracts, findings, and evaluation.",
        workspace_id=result["workspace_id"],
        user_emails=result["user_emails"],
        document_ids=result["document_ids"],
    )

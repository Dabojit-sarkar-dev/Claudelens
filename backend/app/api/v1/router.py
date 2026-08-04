from app.api.v1 import auth, contracts, dev, evaluations, findings, workspaces
from fastapi import APIRouter

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(workspaces.router, prefix="/workspaces", tags=["workspaces"])
api_router.include_router(contracts.router, prefix="/contracts", tags=["contracts"])
api_router.include_router(findings.router, prefix="/findings", tags=["findings"])
api_router.include_router(evaluations.router, prefix="/evaluations", tags=["evaluations"])
api_router.include_router(dev.router, prefix="/dev", tags=["dev"])

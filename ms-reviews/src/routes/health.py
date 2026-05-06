from fastapi import APIRouter
from datetime import datetime

router = APIRouter(tags=["Sistema"])

@router.get("/health")
async def health():
    return {"status": "ok", "service": "ms-reviews", "version": "2.0.0", "timestamp": datetime.utcnow()}

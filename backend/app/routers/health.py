from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.inference.loader import get_model_card, is_model_loaded
router = APIRouter(tags=['health'])

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_version: str | None = None

@router.get('/health', response_model=HealthResponse)
async def health_check():
    if not is_model_loaded():
        raise HTTPException(status_code=503, detail='Model not loaded')
    model_card = get_model_card()
    version = model_card.get('model_version') if model_card else None
    return HealthResponse(status='ok', model_loaded=True, model_version=version)

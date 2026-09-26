from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.schemas import HistoryResponse, HistoryItem
from app.data.regions import region_exists, get_reference_rows
from app.inference import get_model_card
from datetime import datetime
router = APIRouter(tags=['history'])

@router.get('/history/{region_id}', response_model=HistoryResponse)
async def get_history(region_id: str, limit: int=Query(20, ge=1, le=100, description='Number of historical cases to return')):
    if not region_exists(region_id):
        raise HTTPException(status_code=404, detail=f'Unknown region_id: {region_id}')
    ref_data = get_reference_rows(region_id, lead_day=1)
    if ref_data.empty:
        return HistoryResponse(region_id=region_id, history=[])
    history_items = []
    for _, row in ref_data.head(limit).iterrows():
        bust_prob = row.get('bust_probability', 0.3)
        actual_error = row.get('actual_error', 1.5)
        model_card = get_model_card()
        threshold = model_card.get('bust_threshold', 0.5)
        was_bust = bust_prob > threshold
        history_items.append(HistoryItem(valid_time=row.get('valid_time', datetime.utcnow()), lead_day=int(row.get('lead_day', 1)), bust_probability=float(bust_prob), actual_error=float(actual_error), was_bust=bool(was_bust)))
    return HistoryResponse(region_id=region_id, history=history_items)

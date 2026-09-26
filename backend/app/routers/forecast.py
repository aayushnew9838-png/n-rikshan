from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.schemas import RegionsResponse, RegionInfo, SummaryResponse, SummaryItem
from app.data.regions import get_regions, get_region_by_id
from app.inference import predict_bust_probability, prepare_features, get_confidence_info, get_model_card, PredictionError
router = APIRouter(tags=['forecast'])
_STUB_FEATURES = {'feature_1': 0.0, 'feature_2': 50.0, 'feature_3': 0.0}

@router.get('/forecast/regions', response_model=RegionsResponse)
async def list_regions():
    regions_data = get_regions()
    regions = [RegionInfo(region_id=r['region_id'], name=r['name'], lat=r['lat'], lon=r['lon']) for r in regions_data]
    return RegionsResponse(regions=regions)

@router.get('/forecast/summary', response_model=SummaryResponse)
async def get_summary(days: int=Query(10, ge=1, le=10, description='Number of lead days (1-10)')):
    regions_data = get_regions()
    model_card = get_model_card()
    threshold = model_card.get('bust_threshold', 0.5)
    summaries = []
    for region in regions_data:
        region_id = region['region_id']
        for lead_day in range(1, days + 1):
            try:
                bust_prob = predict_bust_probability(region_id=region_id, lead_day=lead_day, features=_STUB_FEATURES)
                confidence_info = get_confidence_info(bust_prob)
                if bust_prob < threshold * 0.5:
                    risk_level = 'low'
                elif bust_prob < threshold:
                    risk_level = 'medium'
                else:
                    risk_level = 'high'
                summaries.append(SummaryItem(region_id=region_id, lead_day=lead_day, bust_probability=bust_prob, confidence=confidence_info['confidence'], risk_level=risk_level))
            except PredictionError:
                continue
            except Exception:
                continue
    return SummaryResponse(summaries=summaries)

from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from app.schemas import PredictRequest, PredictResponse, ReasonItem
from app.inference import predict_bust_probability, prepare_features, get_shap_contributions, get_top_reasons, get_confidence_info, get_model_card, PredictionError
router = APIRouter(tags=['predict'])

@router.post('/predict', response_model=PredictResponse)
async def predict(request: PredictRequest):
    try:
        bust_prob = predict_bust_probability(region_id=request.region_id, lead_day=request.lead_day, features=request.features)
        X = prepare_features(region_id=request.region_id, lead_day=request.lead_day, features=request.features)
        contributions = get_shap_contributions(X)
        top_reasons_data = get_top_reasons(contributions, top_k=3)
        top_reasons = [ReasonItem(feature=r['feature'], contribution=r['contribution'], reason=r['reason']) for r in top_reasons_data]
        confidence_info = get_confidence_info(bust_prob)
        model_card = get_model_card()
        model_version = model_card.get('model_version', 'unknown')
        return PredictResponse(region_id=request.region_id, lead_day=request.lead_day, bust_probability=bust_prob, confidence=confidence_info['confidence'], confidence_label=confidence_info['confidence_label'], top_reasons=top_reasons, model_version=model_version, timestamp=datetime.utcnow())
    except PredictionError as e:
        if 'unknown region' in str(e).lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        elif 'validation failed' in str(e).lower() or 'missing required' in str(e).lower():
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail={'message': str(e), 'issues': e.issues})
        else:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f'Prediction failed: {str(e)}')

from app.config import get_settings
settings = get_settings()

def probability_to_confidence(bust_probability: float) -> float:
    model_card = get_model_card()
    threshold = model_card.get('bust_threshold', 0.5)
    max_distance = max(threshold, 1.0 - threshold)
    distance = abs(bust_probability - threshold)
    if max_distance > 0:
        confidence = distance / max_distance
    else:
        confidence = 0.0
    return float(confidence)

def confidence_to_label(confidence: float) -> str:
    low_thresh = settings.CONFIDENCE_LOW_THRESHOLD
    high_thresh = settings.CONFIDENCE_HIGH_THRESHOLD
    if confidence < low_thresh:
        return 'low'
    elif confidence < high_thresh:
        return 'medium'
    else:
        return 'high'

def get_confidence_info(bust_probability: float) -> dict:
    confidence = probability_to_confidence(bust_probability)
    label = confidence_to_label(confidence)
    return {'confidence': confidence, 'confidence_label': label}

def get_model_card():
    from app.inference.loader import get_model_card as _get_model_card
    return _get_model_card()

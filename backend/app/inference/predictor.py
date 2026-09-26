import logging
from typing import Any
import numpy as np
import pandas as pd
from app.inference.loader import get_model, get_preprocessor, get_feature_schema
from app.data.qa import validate_features
from app.data.regions import region_exists, get_reference_rows
logger = logging.getLogger(__name__)

class PredictionError(Exception):

    def __init__(self, message: str, issues: list[dict] | None=None):
        super().__init__(message)
        self.issues = issues or []

def prepare_features(region_id: str, lead_day: int, features: dict[str, float] | None) -> np.ndarray:
    schema = get_feature_schema()
    expected_features = [f.get('name') if isinstance(f, dict) else f for f in schema.get('features', [])]
    if features is None:
        ref_rows = get_reference_rows(region_id, lead_day)
        if ref_rows.empty:
            raise PredictionError(f'No reference data found for region={region_id}, lead_day={lead_day}')
        row = ref_rows.iloc[0]
        features = {name: row[name] for name in expected_features if name in row.columns}
    issues = validate_features(features, lead_day, region_id)
    if issues:
        error_msgs = '; '.join([f"{i['field']}: {i['issue']}" for i in issues])
        raise PredictionError(f'Feature validation failed: {error_msgs}', issues)
    feature_vector = [features[name] for name in expected_features]
    X = np.array([feature_vector], dtype=float)
    preprocessor = get_preprocessor()
    X_processed = preprocessor.transform(X)
    return X_processed

def predict_bust_probability(region_id: str, lead_day: int, features: dict[str, float] | None=None) -> float:
    if not region_exists(region_id):
        raise PredictionError(f'Unknown region_id: {region_id}')
    X = prepare_features(region_id, lead_day, features)
    model = get_model()
    proba = model.predict_proba(X)
    bust_prob = float(proba[0, 1])
    logger.info(f'Prediction: region_id={region_id}, lead_day={lead_day}, bust_probability={bust_prob:.4f}')
    return bust_prob

import logging
from typing import Any
import numpy as np
import pandas as pd
from app.inference.loader import get_feature_schema
from app.config import get_settings
logger = logging.getLogger(__name__)
settings = get_settings()

def validate_features(features: dict[str, float], lead_day: int, region_id: str) -> list[dict[str, Any]]:
    issues = []
    schema = get_feature_schema()
    expected_features = schema.get('features', [])
    for feat in expected_features:
        name = feat.get('name') if isinstance(feat, dict) else feat
        if name not in features:
            issues.append({'field': name, 'issue': f'Missing required feature: {name}', 'value': None})
    for feat in expected_features:
        name = feat.get('name') if isinstance(feat, dict) else feat
        if name in features:
            val = features[name]
            if val is None or (isinstance(val, float) and np.isnan(val)):
                issues.append({'field': name, 'issue': f'Feature has NaN/None value: {name}', 'value': val})
    for feat in expected_features:
        if not isinstance(feat, dict):
            continue
        name = feat.get('name')
        if name not in features:
            continue
        val = features[name]
        if val is None:
            continue
        if 'min' in feat and val < feat['min']:
            issues.append({'field': name, 'issue': f"Value {val} below minimum {feat['min']}", 'value': val})
        if 'max' in feat and val > feat['max']:
            issues.append({'field': name, 'issue': f"Value {val} above maximum {feat['max']}", 'value': val})
    for name in features:
        if name not in [f.get('name') if isinstance(f, dict) else f for f in expected_features]:
            logger.warning(f'Unexpected feature in input: {name} (region={region_id}, lead_day={lead_day})')
    return issues

def validate_region_exists(region_id: str) -> bool:
    ref_data = get_reference_data()
    if ref_data is None:
        return True
    return region_id in ref_data.get('region_id', pd.Series()).values

def get_reference_data() -> pd.DataFrame | None:
    from app.inference.loader import get_reference_data as loader_get_ref
    return loader_get_ref()

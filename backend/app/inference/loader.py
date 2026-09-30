import json
import logging
from pathlib import Path
from typing import Any
import joblib
import pandas as pd
from app.config import get_settings
settings = get_settings()
logger = logging.getLogger(__name__)
_model = None
_preprocessor = None
_feature_schema: dict[str, Any] = {}
_model_card: dict[str, Any] = {}
_reference_data: pd.DataFrame | None = None
_artifacts_loaded = False

def load_artifacts() -> None:
    global _model, _preprocessor, _feature_schema, _model_card, _reference_data, _artifacts_loaded
    if _artifacts_loaded:
        return
    try:
        if settings.MODEL_PATH.exists():
            _model = joblib.load(settings.MODEL_PATH)
            logger.info(f'Loaded model from {settings.MODEL_PATH}')
        else:
            logger.warning(f'Model not found at {settings.MODEL_PATH}, using stub')
            _model = _create_stub_model()
        if settings.FEATURE_SCHEMA_PATH.exists():
            with open(settings.FEATURE_SCHEMA_PATH) as f:
                _feature_schema = json.load(f)
            logger.info(f'Loaded feature schema from {settings.FEATURE_SCHEMA_PATH}')
        else:
            logger.warning(f'Feature schema not found at {settings.FEATURE_SCHEMA_PATH}, using stub')
            _feature_schema = _create_stub_feature_schema()
        if settings.PREPROCESSOR_PATH.exists():
            _preprocessor = joblib.load(settings.PREPROCESSOR_PATH)
            logger.info(f'Loaded preprocessor from {settings.PREPROCESSOR_PATH}')
        else:
            logger.warning(f'Preprocessor not found at {settings.PREPROCESSOR_PATH}, using stub')
            n_features = len(_feature_schema.get('features', []))
            _preprocessor = _create_stub_preprocessor(n_features)
        if settings.MODEL_CARD_PATH.exists():
            with open(settings.MODEL_CARD_PATH) as f:
                _model_card = json.load(f)
            logger.info(f'Loaded model card from {settings.MODEL_CARD_PATH}')
        else:
            logger.warning(f'Model card not found at {settings.MODEL_CARD_PATH}, using defaults')
            _model_card = {'model_version': 'stub-1.0.0', 'bust_threshold': settings.BUST_THRESHOLD, 'training_date': '2024-01-01', 'metrics': {}}
        if settings.REFERENCE_DATA_PATH.exists():
            _reference_data = pd.read_parquet(settings.REFERENCE_DATA_PATH)
            logger.info(f'Loaded reference data from {settings.REFERENCE_DATA_PATH}')
        else:
            logger.warning(f'Reference data not found at {settings.REFERENCE_DATA_PATH}')
            _reference_data = None
        _artifacts_loaded = True
        logger.info('All artifacts loaded successfully')
    except Exception as e:
        logger.error(f'Failed to load artifacts: {e}')
        raise

def _create_stub_model():
    from sklearn.dummy import DummyClassifier
    import numpy as np

    class StubModel:
        _is_stub = True

        def predict_proba(self, X):
            n = len(X) if hasattr(X, '__len__') else 1
            return np.array([[0.7, 0.3]] * n)

        def predict(self, X):
            return self.predict_proba(X)[:, 1] > 0.5
    return StubModel()

def _create_stub_preprocessor(n_features: int=10):
    from sklearn.preprocessing import StandardScaler
    import numpy as np

    class StubPreprocessor:

        def __init__(self, n_features: int):
            self.scaler = StandardScaler()
            self.scaler.fit(np.random.randn(100, n_features))

        def transform(self, X):
            return self.scaler.transform(X)

        def fit_transform(self, X):
            return self.scaler.fit_transform(X)
    return StubPreprocessor(n_features)

def _create_stub_feature_schema() -> dict[str, Any]:
    return {'features': [{'name': 'feature_1', 'dtype': 'float', 'min': -10.0, 'max': 10.0}, {'name': 'feature_2', 'dtype': 'float', 'min': 0.0, 'max': 100.0}, {'name': 'feature_3', 'dtype': 'float', 'min': -5.0, 'max': 5.0}]}

def get_model():
    if not _artifacts_loaded:
        load_artifacts()
    return _model

def get_preprocessor():
    if not _artifacts_loaded:
        load_artifacts()
    return _preprocessor

def get_feature_schema() -> dict[str, Any]:
    if not _artifacts_loaded:
        load_artifacts()
    return _feature_schema

def get_model_card() -> dict[str, Any]:
    if not _artifacts_loaded:
        load_artifacts()
    return _model_card

def get_reference_data() -> pd.DataFrame | None:
    if not _artifacts_loaded:
        load_artifacts()
    return _reference_data

def is_model_loaded() -> bool:
    return _artifacts_loaded and _model is not None

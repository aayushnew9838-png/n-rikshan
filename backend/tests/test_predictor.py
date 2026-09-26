import pytest
import numpy as np
from app.inference.predictor import predict_bust_probability, prepare_features, PredictionError
from app.inference.loader import load_artifacts

@pytest.fixture(autouse=True)
def setup_artifacts():
    load_artifacts()

def test_predict_bust_probability_with_features():
    prob = predict_bust_probability(region_id='REG001', lead_day=1, features={'feature_1': 1.0, 'feature_2': 2.0, 'feature_3': 3.0})
    assert isinstance(prob, float)
    assert 0.0 <= prob <= 1.0

def test_predict_bust_probability_without_features():
    with pytest.raises(PredictionError) as exc_info:
        predict_bust_probability(region_id='REG001', lead_day=1, features=None)
    assert 'reference data' in str(exc_info.value).lower() or 'unknown region' in str(exc_info.value).lower()

def test_predict_unknown_region():
    with pytest.raises(PredictionError) as exc_info:
        predict_bust_probability(region_id='UNKNOWN_REGION', lead_day=1, features={'feature_1': 1.0, 'feature_2': 2.0, 'feature_3': 3.0})
    assert 'unknown region' in str(exc_info.value).lower()

def test_predict_missing_features():
    with pytest.raises(PredictionError) as exc_info:
        predict_bust_probability(region_id='REG001', lead_day=1, features={'feature_1': 1.0})
    assert 'missing required feature' in str(exc_info.value).lower()

def test_predict_nan_features():
    import numpy as np
    with pytest.raises(PredictionError) as exc_info:
        predict_bust_probability(region_id='REG001', lead_day=1, features={'feature_1': 1.0, 'feature_2': np.nan, 'feature_3': 3.0})
    assert 'nan' in str(exc_info.value).lower()

def test_predict_none_features():
    with pytest.raises(PredictionError) as exc_info:
        predict_bust_probability(region_id='REG001', lead_day=1, features={'feature_1': 1.0, 'feature_2': None, 'feature_3': 3.0})
    assert 'nan' in str(exc_info.value).lower() or 'none' in str(exc_info.value).lower()

def test_prepare_features_returns_array():
    X = prepare_features(region_id='REG001', lead_day=1, features={'feature_1': 1.0, 'feature_2': 2.0, 'feature_3': 3.0})
    assert isinstance(X, np.ndarray)
    assert X.shape == (1, 3)

def test_prediction_error_contains_issues():
    with pytest.raises(PredictionError) as exc_info:
        predict_bust_probability(region_id='REG001', lead_day=1, features={'feature_1': 1.0})
    assert exc_info.value.issues is not None
    assert len(exc_info.value.issues) >= 2

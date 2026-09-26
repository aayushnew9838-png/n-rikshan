import pytest
from app.data.qa import validate_features, validate_region_exists
from app.inference.loader import load_artifacts

@pytest.fixture(autouse=True)
def setup_artifacts():
    load_artifacts()

def test_validate_features_all_present():
    features = {'feature_1': 1.0, 'feature_2': 2.0, 'feature_3': 3.0}
    issues = validate_features(features, lead_day=1, region_id='REG001')
    assert len(issues) == 0

def test_validate_features_missing_required():
    features = {'feature_1': 1.0}
    issues = validate_features(features, lead_day=1, region_id='REG001')
    assert len(issues) >= 1
    assert any((i['issue'] == 'Missing required feature: feature_2' for i in issues))

def test_validate_features_nan_value():
    import numpy as np
    features = {'feature_1': 1.0, 'feature_2': np.nan}
    issues = validate_features(features, lead_day=1, region_id='REG001')
    assert len(issues) >= 1
    assert any(('NaN' in i['issue'] for i in issues))

def test_validate_features_none_value():
    features = {'feature_1': 1.0, 'feature_2': None}
    issues = validate_features(features, lead_day=1, region_id='REG001')
    assert len(issues) >= 1
    assert any(('NaN' in i['issue'] or 'None' in i['issue'] for i in issues))

def test_validate_features_out_of_range():
    features = {'feature_1': 1.0, 'feature_2': 100.0}
    issues = validate_features(features, lead_day=1, region_id='REG001')

def test_validate_region_exists_no_ref_data():
    result = validate_region_exists('ANY_REGION')
    assert result is True

class TestSchemas:

    def test_predict_request_valid(self):
        from app.schemas import PredictRequest
        req = PredictRequest(region_id='REG001', lead_day=5, features={'f1': 1.0})
        assert req.region_id == 'REG001'
        assert req.lead_day == 5

    def test_predict_request_invalid_lead_day_low(self):
        from app.schemas import PredictRequest
        with pytest.raises(Exception):
            PredictRequest(region_id='REG001', lead_day=0)

    def test_predict_request_invalid_lead_day_high(self):
        from app.schemas import PredictRequest
        with pytest.raises(Exception):
            PredictRequest(region_id='REG001', lead_day=11)

    def test_predict_request_empty_region_id(self):
        from app.schemas import PredictRequest
        with pytest.raises(Exception):
            PredictRequest(region_id='', lead_day=1)

    def test_predict_response_model(self):
        from app.schemas import PredictResponse, ReasonItem
        from datetime import datetime
        resp = PredictResponse(region_id='REG001', lead_day=1, bust_probability=0.3, confidence=0.8, confidence_label='high', top_reasons=[ReasonItem(feature='f1', contribution=0.1, reason='reason 1')], model_version='1.0.0', timestamp=datetime.now())
        assert resp.bust_probability == 0.3
        assert resp.confidence_label == 'high'

    def test_regions_response(self):
        from app.schemas import RegionsResponse, RegionInfo
        resp = RegionsResponse(regions=[RegionInfo(region_id='REG001', name='North', lat=35.0, lon=-100.0)])
        assert len(resp.regions) == 1
        assert resp.regions[0].region_id == 'REG001'

    def test_summary_response(self):
        from app.schemas import SummaryResponse, SummaryItem
        resp = SummaryResponse(summaries=[SummaryItem(region_id='REG001', lead_day=1, bust_probability=0.2, confidence=0.9, risk_level='low')])
        assert len(resp.summaries) == 1

    def test_history_response(self):
        from app.schemas import HistoryResponse, HistoryItem
        from datetime import datetime
        resp = HistoryResponse(region_id='REG001', history=[HistoryItem(valid_time=datetime.now(), lead_day=1, bust_probability=0.3, actual_error=1.5, was_bust=False)])
        assert len(resp.history) == 1

    def test_health_response(self):
        from app.schemas import HealthResponse
        resp = HealthResponse(status='ok', model_loaded=True, model_version='1.0.0')
        assert resp.status == 'ok'
        assert resp.model_loaded is True

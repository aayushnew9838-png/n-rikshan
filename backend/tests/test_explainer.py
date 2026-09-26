import pytest
import numpy as np
from app.inference.explainer import get_shap_contributions
from app.inference.predictor import prepare_features
from app.inference.loader import load_artifacts

@pytest.fixture(autouse=True)
def setup_artifacts():
    load_artifacts()

def test_get_shap_contributions_returns_list():
    X = prepare_features(region_id='REG001', lead_day=1, features={'feature_1': 1.0, 'feature_2': 2.0, 'feature_3': 3.0})
    contributions = get_shap_contributions(X)
    assert isinstance(contributions, list)
    assert len(contributions) == 3

def test_shap_contributions_structure():
    X = prepare_features(region_id='REG001', lead_day=1, features={'feature_1': 1.0, 'feature_2': 2.0, 'feature_3': 3.0})
    contributions = get_shap_contributions(X)
    for item in contributions:
        assert 'feature' in item
        assert 'contribution' in item
        assert isinstance(item['feature'], str)
        assert isinstance(item['contribution'], float)

def test_shap_contributions_sorted_by_abs():
    X = prepare_features(region_id='REG001', lead_day=1, features={'feature_1': 1.0, 'feature_2': 2.0, 'feature_3': 3.0})
    contributions = get_shap_contributions(X)
    abs_values = [abs(c['contribution']) for c in contributions]
    assert abs_values == sorted(abs_values, reverse=True)

def test_shap_feature_names_match_schema():
    X = prepare_features(region_id='REG001', lead_day=1, features={'feature_1': 1.0, 'feature_2': 2.0, 'feature_3': 3.0})
    contributions = get_shap_contributions(X)
    feature_names = [c['feature'] for c in contributions]
    expected = ['feature_1', 'feature_2', 'feature_3']
    assert set(feature_names) == set(expected)

class TestReasons:

    def test_get_reason_for_feature_exact_match(self):
        from app.inference.reasons import get_reason_for_feature
        reason = get_reason_for_feature('ensemble_spread', 0.1)
        assert 'ensemble spread' in reason.lower()

    def test_get_reason_for_feature_partial_match(self):
        from app.inference.reasons import get_reason_for_feature
        reason = get_reason_for_feature('ensemble_spread_temp', 0.1)
        assert 'ensemble spread' in reason.lower() or 'temperature' in reason.lower()

    def test_get_reason_for_feature_unknown(self):
        from app.inference.reasons import get_reason_for_feature
        reason = get_reason_for_feature('unknown_feature_xyz', 0.1)
        assert 'unknown_feature_xyz' in reason or 'increases bust risk' in reason

    def test_get_reason_direction_positive(self):
        from app.inference.reasons import get_reason_for_feature
        reason = get_reason_for_feature('feature_1', 0.5)
        assert 'pushes probability up' in reason

    def test_get_reason_direction_negative(self):
        from app.inference.reasons import get_reason_for_feature
        reason = get_reason_for_feature('feature_1', -0.5)
        assert 'pushes probability down' in reason

    def test_get_top_reasons_returns_top_k(self):
        from app.inference.reasons import get_top_reasons
        contributions = [{'feature': 'f1', 'contribution': 0.5}, {'feature': 'f2', 'contribution': -0.3}, {'feature': 'f3', 'contribution': 0.1}, {'feature': 'f4', 'contribution': -0.05}]
        reasons = get_top_reasons(contributions, top_k=2)
        assert len(reasons) == 2
        assert reasons[0]['feature'] == 'f1'
        assert reasons[1]['feature'] == 'f2'

    def test_get_top_reasons_structure(self):
        from app.inference.reasons import get_top_reasons
        contributions = [{'feature': 'f1', 'contribution': 0.5}]
        reasons = get_top_reasons(contributions, top_k=1)
        assert 'feature' in reasons[0]
        assert 'contribution' in reasons[0]
        assert 'reason' in reasons[0]
        assert isinstance(reasons[0]['reason'], str)
        assert len(reasons[0]['reason']) > 0

class TestConfidence:

    def test_confidence_at_threshold_is_zero(self):
        from app.inference.confidence import probability_to_confidence
        conf = probability_to_confidence(0.5)
        assert abs(conf - 0.0) < 0.01

    def test_confidence_at_extremes_is_one(self):
        from app.inference.confidence import probability_to_confidence
        conf_low = probability_to_confidence(0.0)
        conf_high = probability_to_confidence(1.0)
        assert abs(conf_low - 1.0) < 0.01
        assert abs(conf_high - 1.0) < 0.01

    def test_confidence_symmetric_around_threshold(self):
        from app.inference.confidence import probability_to_confidence
        conf1 = probability_to_confidence(0.3)
        conf2 = probability_to_confidence(0.7)
        assert abs(conf1 - conf2) < 0.01

    def test_confidence_label_low(self):
        from app.inference.confidence import confidence_to_label
        label = confidence_to_label(0.2)
        assert label == 'low'

    def test_confidence_label_medium(self):
        from app.inference.confidence import confidence_to_label
        label = confidence_to_label(0.5)
        assert label == 'medium'

    def test_confidence_label_high(self):
        from app.inference.confidence import confidence_to_label
        label = confidence_to_label(0.8)
        assert label == 'high'

    def test_get_confidence_info_structure(self):
        from app.inference.confidence import get_confidence_info
        info = get_confidence_info(0.3)
        assert 'confidence' in info
        assert 'confidence_label' in info
        assert isinstance(info['confidence'], float)
        assert info['confidence_label'] in ['low', 'medium', 'high']

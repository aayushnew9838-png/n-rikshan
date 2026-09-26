import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

class TestPredictRouter:

    def test_predict_valid_request(self, client):
        response = client.post('/api/v1/predict', json={'region_id': 'REG001', 'lead_day': 1, 'features': {'feature_1': 1.0, 'feature_2': 2.0, 'feature_3': 3.0}})
        assert response.status_code == 200
        data = response.json()
        assert data['region_id'] == 'REG001'
        assert data['lead_day'] == 1
        assert 0.0 <= data['bust_probability'] <= 1.0
        assert 0.0 <= data['confidence'] <= 1.0
        assert data['confidence_label'] in ['low', 'medium', 'high']
        assert len(data['top_reasons']) <= 3
        assert 'model_version' in data
        assert 'timestamp' in data

    def test_predict_invalid_lead_day_low(self, client):
        response = client.post('/api/v1/predict', json={'region_id': 'REG001', 'lead_day': 0, 'features': {'feature_1': 1.0, 'feature_2': 2.0, 'feature_3': 3.0}})
        assert response.status_code == 422

    def test_predict_invalid_lead_day_high(self, client):
        response = client.post('/api/v1/predict', json={'region_id': 'REG001', 'lead_day': 11, 'features': {'feature_1': 1.0, 'feature_2': 2.0, 'feature_3': 3.0}})
        assert response.status_code == 422

    def test_predict_missing_features(self, client):
        response = client.post('/api/v1/predict', json={'region_id': 'REG001', 'lead_day': 1, 'features': {'feature_1': 1.0}})
        assert response.status_code == 422
        data = response.json()
        assert 'issues' in data.get('detail', {})

    def test_predict_nan_features(self, client):
        response = client.post('/api/v1/predict', json={'region_id': 'REG001', 'lead_day': 1, 'features': {'feature_1': 1.0, 'feature_2': None, 'feature_3': 3.0}})
        assert response.status_code == 422

    def test_predict_unknown_region(self, client):
        response = client.post('/api/v1/predict', json={'region_id': 'UNKNOWN_REGION', 'lead_day': 1, 'features': {'feature_1': 1.0, 'feature_2': 2.0, 'feature_3': 3.0}})
        assert response.status_code == 404

    def test_predict_without_features(self, client):
        response = client.post('/api/v1/predict', json={'region_id': 'REG001', 'lead_day': 1})
        assert response.status_code in [404, 422, 500]

class TestHistoryRouter:

    def test_history_valid_region(self, client):
        response = client.get('/api/v1/history/REG001')
        assert response.status_code == 200
        data = response.json()
        assert data['region_id'] == 'REG001'
        assert isinstance(data['history'], list)

    def test_history_unknown_region(self, client):
        response = client.get('/api/v1/history/UNKNOWN_REGION')
        assert response.status_code == 404

    def test_history_limit_param(self, client):
        response = client.get('/api/v1/history/REG001?limit=5')
        assert response.status_code == 200
        data = response.json()
        assert len(data['history']) <= 5

class TestForecastRouter:

    def test_regions_endpoint(self, client):
        response = client.get('/api/v1/forecast/regions')
        assert response.status_code == 200
        data = response.json()
        assert 'regions' in data
        assert isinstance(data['regions'], list)
        if len(data['regions']) > 0:
            assert 'region_id' in data['regions'][0]
            assert 'name' in data['regions'][0]
            assert 'lat' in data['regions'][0]
            assert 'lon' in data['regions'][0]

    def test_summary_endpoint(self, client):
        response = client.get('/api/v1/forecast/summary?days=3')
        assert response.status_code == 200
        data = response.json()
        assert 'summaries' in data
        assert isinstance(data['summaries'], list)
        for item in data['summaries']:
            assert 'region_id' in item
            assert 'lead_day' in item
            assert 0.0 <= item['bust_probability'] <= 1.0
            assert 0.0 <= item['confidence'] <= 1.0
            assert item['risk_level'] in ['low', 'medium', 'high']

    def test_summary_days_param(self, client):
        response = client.get('/api/v1/forecast/summary?days=5')
        assert response.status_code == 200
        data = response.json()
        lead_days = set((item['lead_day'] for item in data['summaries']))
        assert max(lead_days) <= 5

class TestHealthRouter:

    def test_health_endpoint(self, client):
        response = client.get('/api/v1/health')
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'ok'
        assert data['model_loaded'] is True
        assert 'model_version' in data

    def test_root_endpoint(self, client):
        response = client.get('/')
        assert response.status_code == 200
        data = response.json()
        assert 'message' in data

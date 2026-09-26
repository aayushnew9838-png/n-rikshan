import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_health_endpoint(client):
    response = client.get('/api/v1/health')
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'ok'
    assert data['model_loaded'] is True
    assert 'model_version' in data

def test_root_endpoint(client):
    response = client.get('/')
    assert response.status_code == 200
    data = response.json()
    assert 'message' in data

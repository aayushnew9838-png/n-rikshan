import httpx
import json
import sys
import time
BASE_URL = 'http://localhost:8000'
API_PREFIX = '/api/v1'

def print_response(name: str, response: httpx.Response):
    print(f"\n{'=' * 60}")
    print(f'{name}')
    print(f"{'=' * 60}")
    print(f'Status: {response.status_code}')
    try:
        data = response.json()
        print(json.dumps(data, indent=2, default=str))
    except Exception:
        print(response.text)
    print()

def test_health(client: httpx.Client):
    response = client.get(f'{API_PREFIX}/health')
    print_response('GET /health', response)
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'ok'
    assert data['model_loaded'] is True
    return True

def test_root(client: httpx.Client):
    response = client.get('/')
    print_response('GET /', response)
    assert response.status_code == 200
    return True

def test_regions(client: httpx.Client):
    response = client.get(f'{API_PREFIX}/forecast/regions')
    print_response('GET /forecast/regions', response)
    assert response.status_code == 200
    data = response.json()
    assert 'regions' in data
    assert isinstance(data['regions'], list)
    assert len(data['regions']) > 0
    return True

def test_summary(client: httpx.Client):
    response = client.get(f'{API_PREFIX}/forecast/summary?days=3')
    print_response('GET /forecast/summary?days=3', response)
    assert response.status_code == 200
    data = response.json()
    assert 'summaries' in data
    assert isinstance(data['summaries'], list)
    assert len(data['summaries']) > 0
    for item in data['summaries']:
        assert 'region_id' in item
        assert 'lead_day' in item
        assert 'bust_probability' in item
        assert 'confidence' in item
        assert 'risk_level' in item
    return True

def test_predict(client: httpx.Client):
    response = client.post(f'{API_PREFIX}/predict', json={'region_id': 'REG001', 'lead_day': 1, 'features': {'feature_1': 1.0, 'feature_2': 50.0, 'feature_3': 0.0}})
    print_response('POST /predict (valid)', response)
    assert response.status_code == 200
    data = response.json()
    assert data['region_id'] == 'REG001'
    assert data['lead_day'] == 1
    assert 0.0 <= data['bust_probability'] <= 1.0
    assert 0.0 <= data['confidence'] <= 1.0
    assert data['confidence_label'] in ['low', 'medium', 'high']
    assert len(data['top_reasons']) <= 3
    for reason in data['top_reasons']:
        assert 'feature' in reason
        assert 'contribution' in reason
        assert 'reason' in reason
    assert 'model_version' in data
    assert 'timestamp' in data
    return True

def test_predict_invalid_lead_day(client: httpx.Client):
    response = client.post(f'{API_PREFIX}/predict', json={'region_id': 'REG001', 'lead_day': 15, 'features': {'feature_1': 1.0, 'feature_2': 50.0, 'feature_3': 0.0}})
    print_response('POST /predict (invalid lead_day=15)', response)
    assert response.status_code == 422
    return True

def test_predict_missing_features(client: httpx.Client):
    response = client.post(f'{API_PREFIX}/predict', json={'region_id': 'REG001', 'lead_day': 1, 'features': {'feature_1': 1.0}})
    print_response('POST /predict (missing features)', response)
    assert response.status_code == 422
    return True

def test_predict_unknown_region(client: httpx.Client):
    response = client.post(f'{API_PREFIX}/predict', json={'region_id': 'UNKNOWN_REGION', 'lead_day': 1, 'features': {'feature_1': 1.0, 'feature_2': 50.0, 'feature_3': 0.0}})
    print_response('POST /predict (unknown region)', response)
    assert response.status_code == 404
    return True

def test_history(client: httpx.Client):
    response = client.get(f'{API_PREFIX}/history/REG001?limit=5')
    print_response('GET /history/REG001?limit=5', response)
    assert response.status_code == 200
    data = response.json()
    assert data['region_id'] == 'REG001'
    assert isinstance(data['history'], list)
    assert len(data['history']) <= 5
    return True

def test_history_unknown_region(client: httpx.Client):
    response = client.get(f'{API_PREFIX}/history/UNKNOWN_REGION')
    print_response('GET /history/UNKNOWN_REGION', response)
    assert response.status_code == 404
    return True

def run_smoke_tests():
    print('Starting end-to-end smoke tests...')
    print(f'Target: {BASE_URL}')
    max_retries = 10
    for i in range(max_retries):
        try:
            with httpx.Client(base_url=BASE_URL, timeout=5.0) as client:
                response = client.get(f'{API_PREFIX}/health')
                if response.status_code == 200:
                    print('Server is ready!')
                    break
        except Exception:
            pass
        print(f'Waiting for server... ({i + 1}/{max_retries})')
        time.sleep(1)
    else:
        print('ERROR: Server not responding after retries')
        return False
    tests = [('Health', test_health), ('Root', test_root), ('Regions', test_regions), ('Summary', test_summary), ('Predict Valid', test_predict), ('Predict Invalid Lead Day', test_predict_invalid_lead_day), ('Predict Missing Features', test_predict_missing_features), ('Predict Unknown Region', test_predict_unknown_region), ('History Valid', test_history), ('History Unknown Region', test_history_unknown_region)]
    passed = 0
    failed = 0
    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        for name, test_fn in tests:
            try:
                test_fn(client)
                print(f'✅ {name} PASSED')
                passed += 1
            except AssertionError as e:
                print(f'❌ {name} FAILED: {e}')
                failed += 1
            except Exception as e:
                print(f'❌ {name} ERROR: {e}')
                failed += 1
    print(f"\n{'=' * 60}")
    print(f'SMOKE TEST RESULTS: {passed} passed, {failed} failed')
    print(f"{'=' * 60}")
    return failed == 0
if __name__ == '__main__':
    success = run_smoke_tests()
    sys.exit(0 if success else 1)

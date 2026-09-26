# Forecast Bust Detection API

Backend for SIH26079 — AI-Based Forecast Bust Detection for Medium-Range Weather Forecasts.

Predicts the probability that a numerical weather forecast will "bust" (large error) for a given region and lead day (1–10), plus confidence score and plain-language reasons.

## Quick Start

### 1. Install Dependencies
```bash
cd backend
python -m pip install -r requirements.txt
```

### 2. Run the Server
```bash
# Development (with auto-reload)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Production
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 3. Verify It's Running
```bash
curl http://localhost:8000/api/v1/health
# {"status":"ok","model_loaded":true,"model_version":"stub-1.0.0"}
```

OpenAPI docs: http://localhost:8000/docs

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_HOST` | `0.0.0.0` | Server host |
| `APP_PORT` | `8000` | Server port |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:5173` | Comma-separated allowed origins |
| `LOG_LEVEL` | `INFO` | Logging level |
| `MODEL_PATH` | `artifacts/model.joblib` | Path to trained model |
| `PREPROCESSOR_PATH` | `artifacts/preprocessor.joblib` | Path to preprocessor pipeline |
| `FEATURE_SCHEMA_PATH` | `artifacts/feature_schema.json` | Path to feature schema |
| `MODEL_CARD_PATH` | `artifacts/model_card.json` | Path to model metadata |
| `REFERENCE_DATA_PATH` | `artifacts/reference_dataset.parquet` | Path to historical data |
| `CONFIDENCE_LOW_THRESHOLD` | `0.4` | Confidence < this → "low" |
| `CONFIDENCE_HIGH_THRESHOLD` | `0.7` | Confidence ≥ this → "high" |
| `BUST_THRESHOLD` | `0.5` | Fallback bust decision threshold |

## API Endpoints

### POST `/api/v1/predict`
Predict bust probability for a region and lead day.

**Request:**
```json
{
  "region_id": "REG001",
  "lead_day": 3,
  "features": {
    "feature_1": 1.2,
    "feature_2": 45.0,
    "feature_3": -0.5
  }
}
```

**Response:**
```json
{
  "region_id": "REG001",
  "lead_day": 3,
  "bust_probability": 0.35,
  "confidence": 0.62,
  "confidence_label": "medium",
  "top_reasons": [
    {
      "feature": "feature_2",
      "contribution": 0.12,
      "reason": "Secondary forecast metric is outside normal range (pushes probability up)"
    },
    {
      "feature": "feature_1",
      "contribution": -0.08,
      "reason": "Key forecast indicator shows unusual values (pushes probability down)"
    },
    {
      "feature": "feature_3",
      "contribution": 0.03,
      "reason": "Tertiary forecast signal contributes to bust risk (pushes probability up)"
    }
  ],
  "model_version": "stub-1.0.0",
  "timestamp": "2026-09-25T10:30:00.000000"
}
```

**Error Responses:**
- `422` - Invalid input (lead_day not 1-10, missing features, NaN values)
- `404` - Unknown region_id
- `500` - Internal server error

---

### GET `/api/v1/forecast/regions`
List all available regions.

**Response:**
```json
{
  "regions": [
    {"region_id": "REG001", "name": "North Region", "lat": 35.0, "lon": -100.0},
    {"region_id": "REG002", "name": "South Region", "lat": 30.0, "lon": -95.0}
  ]
}
```

---

### GET `/api/v1/forecast/summary?days=10`
Get Day 1–10 bust probability map for all regions (for dashboard map).

**Response:**
```json
{
  "summaries": [
    {"region_id": "REG001", "lead_day": 1, "bust_probability": 0.2, "confidence": 0.8, "risk_level": "low"},
    {"region_id": "REG001", "lead_day": 2, "bust_probability": 0.3, "confidence": 0.6, "risk_level": "medium"},
    ...
  ]
}
```

---

### GET `/api/v1/history/{region_id}?limit=20`
Get past verification cases for a region.

**Response:**
```json
{
  "region_id": "REG001",
  "history": [
    {
      "valid_time": "2026-09-01T00:00:00",
      "lead_day": 1,
      "bust_probability": 0.3,
      "actual_error": 1.5,
      "was_bust": false
    }
  ]
}
```

---

### GET `/api/v1/health`
Health check.

**Response:**
```json
{
  "status": "ok",
  "model_loaded": true,
  "model_version": "stub-1.0.0"
}
```

## Sample cURL Commands

```bash
# Health check
curl http://localhost:8000/api/v1/health

# List regions
curl http://localhost:8000/api/v1/forecast/regions

# Forecast summary (3 days)
curl "http://localhost:8000/api/v1/forecast/summary?days=3"

# Predict with features
curl -X POST http://localhost:8000/api/v1/predict \
  -H "Content-Type: application/json" \
  -d '{
    "region_id": "REG001",
    "lead_day": 1,
    "features": {"feature_1": 1.0, "feature_2": 50.0, "feature_3": 0.0}
  }'

# Predict without features (uses reference data)
curl -X POST http://localhost:8000/api/v1/predict \
  -H "Content-Type: application/json" \
  -d '{"region_id": "REG001", "lead_day": 3}'

# History
curl "http://localhost:8000/api/v1/history/REG001?limit=10"

# Error cases
curl -X POST http://localhost:8000/api/v1/predict \
  -H "Content-Type: application/json" \
  -d '{"region_id": "REG001", "lead_day": 15, "features": {}}'
# 422 - lead_day must be 1-10

curl -X POST http://localhost:8000/api/v1/predict \
  -H "Content-Type: application/json" \
  -d '{"region_id": "UNKNOWN", "lead_day": 1, "features": {}}'
# 404 - unknown region
```

## Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI app, lifespan, CORS
│   ├── config.py               # Settings via environment variables
│   ├── _schemas.py             # Pydantic request/response models
│   ├── inference/
│   │   ├── loader.py           # Load model, preprocessor, schema at startup
│   │   ├── predictor.py        # Validate -> preprocess -> predict_proba
│   │   ├── explainer.py        # SHAP contributions for single prediction
│   │   ├── reasons.py          # Feature contributions -> plain-language reasons
│   │   └── confidence.py       # Bust probability -> confidence score/label
│   ├── data/
│   │   ├── qa.py               # Feature validation (required, NaN, ranges)
│   │   └── regions.py          # Region lookup utilities
│   └── routers/
│       ├── predict.py          # POST /predict
│       ├── history.py          # GET /history/{region_id}
│       ├── forecast.py         # GET /forecast/regions, /forecast/summary
│       └── health.py           # GET /health
├── tests/
│   ├── test_health.py
│   ├── test_qa.py
│   ├── test_predictor.py
│   ├── test_explainer.py
│   ├── test_routers.py
│   └── test_smoke.py           # End-to-end against live server
├── artifacts/                  # Place model artifacts here
│   ├── model.joblib
│   ├── preprocessor.joblib
│   ├── feature_schema.json
│   ├── model_card.json
│   └── reference_dataset.parquet
├── requirements.txt
└── README.md
```

## Adding Real Model Artifacts

Place your trained artifacts in `backend/artifacts/`:

```
artifacts/
├── model.joblib          # joblib.dump(trained_xgb_model)
├── preprocessor.joblib   # joblib.dump(fitted_preprocessor_pipeline)
├── feature_schema.json   # {"features": [{"name": "f1", "dtype": "float", "min": -10, "max": 10}, ...]}
├── model_card.json       # {"model_version": "v1.2.0", "bust_threshold": 0.52, "training_date": "2026-01-15", "metrics": {...}}
└── reference_dataset.parquet  # Historical DataFrame with region_id, lead_day, features..., bust_probability, actual_error, was_bust
```

The system will automatically use them on next startup (or restart). If artifacts are missing, stub implementations are used for development.

## Running Tests

```bash
# All unit/integration tests (58 tests)
python -m pytest tests/ --ignore=tests/test_smoke.py -v

# End-to-end smoke test (requires server running on localhost:8000)
python tests/test_smoke.py
```

## Business Rules Summary

1. **Input Validation**: Pydantic validates all requests; lead_day must be 1–10 (422 otherwise)
2. **Region Validation**: Unknown region_id returns 404
3. **Feature QA**: Required features present, no NaN/None, values in schema ranges (422 with issue list)
4. **Confidence**: Distance from bust_threshold (0.5 or model_card), mapped to low/medium/high
5. **Reasons**: Top 3 SHAP contributions by absolute value, mapped to plain-language templates
6. **No Target Leakage**: Never exposes true future observations in predictions
7. **Model Loaded Once**: At startup via FastAPI lifespan
8. **Logging**: Each prediction logged with region_id, lead_day, probability, model_version

## License

Internal hackathon project — SIH26079.
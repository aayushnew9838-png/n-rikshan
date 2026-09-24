# Nirikshan ML Subsystem — Frontend Integration & API Contract

**SIH26079 — AI-Based Forecast Bust Detection for Medium-Range Weather Forecasts**  
**API Version:** `v1.0.0`  
**Base URL:** `http://localhost:8000` (or operational gateway)

---

## 1. Overview & Philosophy

Nirikshan acts as an **AI-based reliability intelligence layer** over existing Numerical Weather Prediction (NWP) models (GFS, ECMWF IFS, ICON, GEM).

The ML system does NOT say: *"The weather will be wrong."*  
It computes: **"The probability that the current medium-range forecast will suffer a large realized error (Forecast Bust)."**

---

## 2. Risk Categories & Confidence Scores

The forecast confidence is defined as:
$$\text{Confidence Score} = 100 \times (1 - P_{\text{calibrated}}(\text{bust}))$$

| Confidence Range | Risk Category | Meaning | Frontend UI Badge Color |
|---|---|---|---|
| **80 – 100** | `HIGH_CONFIDENCE` | Forecast models agree strongly; low historical error regime. | 🟢 Green |
| **60 – 79** | `MODERATE_CONFIDENCE` | Acceptable reliability with minor inter-model divergence. | 🟡 Yellow / Gold |
| **40 – 59** | `LOW_CONFIDENCE` | Elevated model spread or rapid synoptic changes. Exercise caution. | 🟠 Orange |
| **0 – 39** | `VERY_LOW_CONFIDENCE_HIGH_RISK` | Severe model disagreement or historically high-bust regime. High risk of forecast failure. | 🔴 Red / Crimson |

---

## 3. Endpoints

### 3.1 `GET /health`
Verifies ML service status and whether models are loaded into memory.

**Response `200 OK`:**
```json
{
  "status": "HEALTHY",
  "service": "nirikshan-ml-inference-api",
  "models_ready": true
}
```

---

### 3.2 `GET /model-info`
Returns active model architecture, calibration technique, training metadata, and top SHAP features.

**Response `200 OK`:**
```json
{
  "model_name": "nirikshan_xgboost_bust_detector",
  "timestamp": "2026-09-24T13:30:00Z",
  "primary_target": "overall_bust",
  "n_features": 133,
  "calibration_method": "isotonic",
  "top_features": [
    {"feature": "lead_hours", "importance": 0.142},
    {"feature": "mm_std_temp", "importance": 0.089},
    {"feature": "hist_bust_rate_temp_w30", "importance": 0.076}
  ]
}
```

---

### 3.3 `POST /predict`
Assess reliability for a single location and lead time.

**Request Body:**
```json
{
  "loc_id": "LOC_1253405",
  "lead_day": 5,
  "lead_hours": 120,
  "forecast_features": {
    "lead_hours": 120.0,
    "lead_age_days": 5.0,
    "mm_std_temp": 3.45,
    "mm_std_precip": 18.2,
    "hist_bust_rate_temp_w30": 0.32,
    "lat": 28.61,
    "lon": 77.20
  }
}
```

**Response `200 OK`:**
```json
{
  "project": "Nirikshan",
  "loc_id": "LOC_1253405",
  "lead_day": 5,
  "lead_hours": 120,
  "bust_probability": 0.742,
  "raw_probability": 0.718,
  "confidence": 25.8,
  "risk_category": "VERY_LOW_CONFIDENCE_HIGH_RISK",
  "status": "SUCCESS",
  "reasons": [
    "Significant disagreement among NWP models (GFS, ECMWF, ICON, GEM) on temperature evolution.",
    "Substantial inter-model divergence in predicted precipitation volume and timing.",
    "Extended forecast lead time increases cumulative dynamical error growth."
  ],
  "stabilizers": [
    "Consistent multi-model estimates of boundary layer humidity."
  ],
  "variable_bust_probabilities": {
    "temperature_2m": 0.68,
    "precipitation": 0.81,
    "wind_speed_10m": 0.34,
    "relative_humidity_2m": 0.22
  },
  "historical_analogs": {
    "n_analogs": 10,
    "historical_bust_rate": 0.70,
    "summary_statement": "7 of 10 similar historical forecasts (70%) experienced a forecast bust under comparable synoptic and multi-model spread conditions.",
    "similar_cases": [
      {
        "loc_id": "LOC_1253405",
        "valid_time": "2025-09-14T06:00:00Z",
        "lead_day": 5,
        "overall_bust": 1,
        "similarity_score": 0.942
      }
    ]
  }
}
```

---

### 3.4 `POST /predict/grid`
Batch geospatial reliability prediction for map visualizations.

**Request Body:**
```json
{
  "lead_day": 3,
  "points": [
    {
      "loc_id": "LOC_DELHI",
      "lat": 28.61,
      "lon": 77.20,
      "admin1": "Delhi",
      "lead_day": 3,
      "forecast_features": { ... }
    },
    {
      "loc_id": "LOC_MUMBAI",
      "lat": 19.07,
      "lon": 72.87,
      "admin1": "Maharashtra",
      "lead_day": 3,
      "forecast_features": { ... }
    }
  ]
}
```

**Response `200 OK`:**
```json
{
  "project": "Nirikshan",
  "lead_day": 3,
  "total_points": 127,
  "high_risk_count": 18,
  "top_risk_locations": [
    {
      "loc_id": "LOC_DELHI",
      "lat": 28.61,
      "lon": 77.20,
      "admin1": "Delhi",
      "lead_day": 3,
      "bust_probability": 0.82,
      "confidence": 18.0,
      "risk_category": "VERY_LOW_CONFIDENCE_HIGH_RISK"
    }
  ],
  "grid_predictions": [ ... ]
}
```

---

### 3.5 `GET /case-study/{case_id}`
Retrieves verified meteorological case studies (e.g. `CASE_SUCCESSFUL_BUST_DETECTION_LOC_1253405`) for retrospective learning and dashboard demonstration.

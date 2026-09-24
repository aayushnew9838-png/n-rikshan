# Nirikshan ML Subsystem — Architecture & Systems Design

**SIH26079 — AI-Based Forecast Bust Detection for Medium-Range Weather Forecasts**

---

## 1. High-Level Data Flow

```mermaid
graph TD
    A[Raw Multi-Model NWP Shards<br>GFS, ECMWF IFS, ICON, GEM] --> B[Data Validation & Preprocessing]
    C[ERA5-Land Ground Truth] --> B
    B --> D[Core Parquet Frame<br>9.58M rows, 127 Indian Locations]
    D --> E[Chronological & Spatial Splitter]
    E --> F[Training Partition Only]
    F --> G[Threshold Estimation<br>90th percentile consensus error]
    G --> H[Retrospective Bust Labels]
    F --> I[Issue-Time Causal Historical Features]
    I --> J[Feature Matrix Assembly<br>Spread, Deltas, Cyclic, Geography]
    J --> K[Leakage Audit Engine]
    K -->|PASS| L[Model Training Pipeline]
    L --> M[Baseline Models]
    L --> N[Primary XGBoost Classifier]
    L --> O[Variable-Specific Classifiers]
    N --> P[Probability Calibration<br>Platt / Isotonic on Val Split]
    P --> Q[Evaluation Suite & SIH Plots]
    P --> R[SHAP TreeExplainer & Reason Engine]
    F --> S[Historical Analogue Engine]
    P & R & S --> T[Unified Inference Engine / FastAPI]
```

---

## 2. Core Architectural Principles

1. **Zero Future/Target Leakage:**
   - Ground truth (`ERA5-Land`) is consumed **strictly** to compute retrospective target labels on past data.
   - Ground truth fields and contemporaneous error columns are banned from feature matrices.
   - All historical rolling performance features (`hist_err_...`, `hist_bust_rate_...`) are computed strictly prior to forecast issue time $T$.

2. **Strict Chronological Splitting + Spatial Holdout:**
   - Split key: Forecast initialization time (`init_time` / `init_h`).
   - Early 70%: **Train**
   - Middle 15%: **Validation** (used for early stopping & probability calibration)
   - Latest 15%: **Temporal Test**
   - **Spatial Holdout:** ~20% of Indian locations are withheld from training to evaluate generalization to unseen geographical domains.

3. **Probability Calibration:**
   - Raw tree model outputs undergo post-hoc calibration (Platt scaling / Isotonic regression) fitted strictly on the validation partition.
   - Guarantees reliability curves with minimal Brier score and Expected Calibration Error (ECE).

4. **Multi-Model Disagreement Features:**
   - Variance and spread across four global NWP centers (GFS, ECMWF, ICON, GEM) provide core signals of atmospheric regime instability.

5. **Explainability & Contextual Analogs:**
   - SHAP TreeExplainer attributes individual forecast predictions to primary risk drivers.
   - Reason engine converts numeric SHAP contributions into safe, human-interpretable meteorological statements.
   - Nearest-neighbor analogue engine retrieves past verified forecasts with similar multi-model divergence signatures.

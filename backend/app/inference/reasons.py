from typing import Any
REASON_TEMPLATES = {'forecast_change': 'Recent forecast change is large', 'forecast_change_24h': 'Forecast changed significantly in the last 24 hours', 'forecast_change_48h': 'Forecast changed significantly in the last 48 hours', 'forecast_change_magnitude': 'Magnitude of forecast change is high', 'ensemble_spread': 'Ensemble spread is wide, indicating uncertainty', 'ensemble_spread_temp': 'Temperature ensemble spread is high', 'ensemble_spread_wind': 'Wind ensemble spread is high', 'ensemble_spread_precip': 'Precipitation ensemble spread is high', 'model_bias': 'Model has systematic bias for this region', 'model_bias_temp': 'Model temperature bias is significant', 'model_bias_wind': 'Model wind bias is significant', 'recent_mae': 'Recent forecast errors have been large', 'recent_rmse': 'Recent RMSE is above normal', 'climatology_deviation': 'Forecast deviates strongly from climatology', 'seasonal_norm_deviation': 'Forecast is far from seasonal norm', 'anomaly_correlation': 'Anomaly correlation is low', 'pressure_gradient': 'Strong pressure gradient in forecast', 'vorticity': 'High vorticity indicates unstable flow', 'cape': 'High CAPE suggests convective potential', 'shear': 'Strong wind shear present', 'lead_day': 'Forecast lead time reduces reliability', 'lead_day_squared': 'Reliability drops non-linearly with lead time', 'region_complexity': 'Region has complex terrain affecting forecasts', 'coastal_effect': 'Coastal effects increase forecast uncertainty', 'feature_1': 'Key forecast indicator shows unusual values', 'feature_2': 'Secondary forecast metric is outside normal range', 'feature_3': 'Tertiary forecast signal contributes to bust risk'}

def get_reason_for_feature(feature_name: str, contribution: float) -> str:
    if feature_name in REASON_TEMPLATES:
        template = REASON_TEMPLATES[feature_name]
    else:
        template = None
        for key, value in REASON_TEMPLATES.items():
            if key in feature_name.lower() or feature_name.lower() in key:
                template = value
                break
        if template is None:
            if contribution > 0:
                template = f"{feature_name.replace('_', ' ').title()} increases bust risk"
            else:
                template = f"{feature_name.replace('_', ' ').title()} decreases bust risk"
    if contribution > 0:
        return f'{template} (pushes probability up)'
    else:
        return f'{template} (pushes probability down)'

def get_top_reasons(contributions: list[dict[str, Any]], top_k: int=3) -> list[dict[str, Any]]:
    reasons = []
    for item in contributions[:top_k]:
        feature = item['feature']
        contrib = item['contribution']
        reason_text = get_reason_for_feature(feature, contrib)
        reasons.append({'feature': feature, 'contribution': contrib, 'reason': reason_text})
    return reasons

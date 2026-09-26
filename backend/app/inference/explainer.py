import logging
from typing import Any
import numpy as np
import shap
from app.inference.loader import get_model, get_preprocessor, get_feature_schema
logger = logging.getLogger(__name__)

class ShapExplainer:

    def __init__(self):
        self._explainer = None
        self._feature_names: list[str] = []
        self._initialized = False

    def _initialize(self):
        if self._initialized:
            return
        model = get_model()
        schema = get_feature_schema()
        self._feature_names = [f.get('name') if isinstance(f, dict) else f for f in schema.get('features', [])]
        try:
            self._explainer = shap.TreeExplainer(model)
            logger.info('Initialized SHAP TreeExplainer')
        except Exception as e:
            logger.warning(f'TreeExplainer failed, trying generic Explainer: {e}')
            try:
                preprocessor = get_preprocessor()
                n_features = len(self._feature_names)
                background = np.random.randn(50, n_features)
                background = preprocessor.transform(background)
                self._explainer = shap.Explainer(model.predict_proba, background)
                logger.info('Initialized SHAP generic Explainer')
            except Exception as e2:
                logger.error(f'Failed to initialize SHAP explainer: {e2}')
                self._explainer = None
        self._initialized = True

    def explain(self, X_processed: np.ndarray) -> np.ndarray:
        self._initialize()
        if self._explainer is None:
            logger.warning('SHAP explainer not available, returning zeros')
            return np.zeros(len(self._feature_names))
        try:
            shap_values = self._explainer.shap_values(X_processed)
            if isinstance(shap_values, list):
                if len(shap_values) > 1:
                    vals = shap_values[1]
                else:
                    vals = shap_values[0]
            elif shap_values.ndim == 3:
                vals = shap_values[0, :, 1]
            else:
                vals = shap_values[0]
            return np.array(vals, dtype=float)
        except Exception as e:
            logger.error(f'SHAP explanation failed: {e}')
            return np.zeros(len(self._feature_names))

    def get_feature_names(self) -> list[str]:
        self._initialize()
        return self._feature_names
_explainer = ShapExplainer()

def get_shap_contributions(X_processed: np.ndarray) -> list[dict[str, Any]]:
    feature_names = _explainer.get_feature_names()
    contributions = _explainer.explain(X_processed)
    result = [{'feature': name, 'contribution': float(contrib)} for name, contrib in zip(feature_names, contributions)]
    result.sort(key=lambda x: abs(x['contribution']), reverse=True)
    return result

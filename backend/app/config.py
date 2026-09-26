import os
from pathlib import Path
from functools import lru_cache

class Settings:
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    ARTIFACTS_DIR: Path = BASE_DIR / 'artifacts'
    MODEL_PATH: Path = ARTIFACTS_DIR / 'model.joblib'
    PREPROCESSOR_PATH: Path = ARTIFACTS_DIR / 'preprocessor.joblib'
    FEATURE_SCHEMA_PATH: Path = ARTIFACTS_DIR / 'feature_schema.json'
    MODEL_CARD_PATH: Path = ARTIFACTS_DIR / 'model_card.json'
    REFERENCE_DATA_PATH: Path = ARTIFACTS_DIR / 'reference_dataset.parquet'
    APP_HOST: str = os.getenv('APP_HOST', '0.0.0.0')
    APP_PORT: int = int(os.getenv('APP_PORT', '8000'))
    API_PREFIX: str = '/api/v1'
    CORS_ORIGINS: list[str] = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5173').split(',')
    CONFIDENCE_LOW_THRESHOLD: float = float(os.getenv('CONFIDENCE_LOW_THRESHOLD', '0.4'))
    CONFIDENCE_HIGH_THRESHOLD: float = float(os.getenv('CONFIDENCE_HIGH_THRESHOLD', '0.7'))
    BUST_THRESHOLD: float = float(os.getenv('BUST_THRESHOLD', '0.5'))
    LOG_LEVEL: str = os.getenv('LOG_LEVEL', 'INFO')

@lru_cache
def get_settings() -> Settings:
    return Settings()

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import health, predict, history, forecast
settings = get_settings()
logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL), format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info('Starting up...')
    from app.inference import loader
    loader.load_artifacts()
    logger.info('Model artifacts loaded')
    yield
    logger.info('Shutting down...')
app = FastAPI(title='Forecast Bust Detection API', description='AI-Based Forecast Bust Detection for Medium-Range Weather Forecasts', version='1.0.0', lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=settings.CORS_ORIGINS, allow_credentials=True, allow_methods=['*'], allow_headers=['*'])
app.include_router(health.router, prefix=settings.API_PREFIX)
app.include_router(predict.router, prefix=settings.API_PREFIX)
app.include_router(history.router, prefix=settings.API_PREFIX)
app.include_router(forecast.router, prefix=settings.API_PREFIX)

@app.get('/')
async def root():
    return {'message': 'Forecast Bust Detection API', 'docs': '/docs'}

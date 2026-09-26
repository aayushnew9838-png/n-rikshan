from datetime import datetime
from typing import Any
from pydantic import BaseModel, Field, field_validator

class PredictRequest(BaseModel):
    region_id: str = Field(..., min_length=1, description='Region identifier')
    lead_day: int = Field(..., ge=1, le=10, description='Lead day 1-10')
    features: dict[str, float] | None = Field(default=None, description='Optional feature dict; if omitted, fetched from reference data')

    @field_validator('region_id')
    @classmethod
    def validate_region_id(cls, v: str) -> str:
        return v.strip()

class ReasonItem(BaseModel):
    feature: str
    contribution: float
    reason: str

class PredictResponse(BaseModel):
    region_id: str
    lead_day: int
    bust_probability: float = Field(..., ge=0.0, le=1.0)
    confidence: float = Field(..., ge=0.0, le=1.0)
    confidence_label: str = Field(..., pattern='^(low|medium|high)$')
    top_reasons: list[ReasonItem] = Field(..., min_length=0, max_length=3)
    model_version: str
    timestamp: datetime

class RegionInfo(BaseModel):
    region_id: str
    name: str
    lat: float
    lon: float

class RegionsResponse(BaseModel):
    regions: list[RegionInfo]

class SummaryItem(BaseModel):
    region_id: str
    lead_day: int
    bust_probability: float = Field(..., ge=0.0, le=1.0)
    confidence: float = Field(..., ge=0.0, le=1.0)
    risk_level: str = Field(..., pattern='^(low|medium|high)$')

class SummaryResponse(BaseModel):
    summaries: list[SummaryItem]

class HistoryItem(BaseModel):
    valid_time: datetime
    lead_day: int
    bust_probability: float = Field(..., ge=0.0, le=1.0)
    actual_error: float
    was_bust: bool

class HistoryResponse(BaseModel):
    region_id: str
    history: list[HistoryItem]

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_version: str | None = None

class QAIssue(BaseModel):
    field: str
    issue: str
    value: Any | None = None

class QAResponse(BaseModel):
    valid: bool
    issues: list[QAIssue] = []

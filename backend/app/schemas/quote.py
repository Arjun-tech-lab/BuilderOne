"""Quote schemas."""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class QuoteCreate(BaseModel):
    proposed_cost: float = Field(gt=0)
    rate_per_sqft: Optional[float] = None
    estimated_duration: Optional[int] = Field(default=None, ge=1, le=60)
    package_type: str = "STANDARD"
    proposal_description: Optional[str] = None
    included_services: List[str] = []
    excluded_services: Optional[str] = None
    warranty_years: Optional[int] = Field(default=None, ge=0, le=50)
    payment_terms: Optional[str] = None


class QuoteOut(BaseModel):
    id: int
    project_id: int
    builder_id: int
    proposed_cost: float
    rate_per_sqft: Optional[float] = None
    estimated_duration: Optional[int] = None
    package_type: str
    proposal_description: Optional[str] = None
    included_services: List[str] = []
    excluded_services: Optional[str] = None
    warranty_years: Optional[int] = None
    payment_terms: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    # Enriched fields for comparison
    builder_name: Optional[str] = None
    builder_years_experience: Optional[int] = None
    builder_projects_completed: Optional[int] = None
    match_score: Optional[int] = None
    logo_url: Optional[str] = None

    model_config = {"from_attributes": True}


class QuoteStatusUpdate(BaseModel):
    status: str

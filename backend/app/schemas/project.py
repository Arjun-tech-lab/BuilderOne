"""Project and customer schemas."""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    location: str = Field(min_length=1, max_length=120)
    city: str = "Bengaluru"
    pincode: Optional[str] = None
    property_type: str
    plot_size: Optional[float] = None
    built_up_area: Optional[float] = None
    floors: Optional[str] = None
    bedrooms: Optional[str] = None
    bathrooms: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    timeline: Optional[str] = None
    requirements: List[str] = []
    preferred_materials: Optional[str] = None
    additional_requirements: Optional[str] = None
    status: str = "OPEN"


class ProjectUpdate(BaseModel):
    location: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    property_type: Optional[str] = None
    plot_size: Optional[float] = None
    built_up_area: Optional[float] = None
    floors: Optional[str] = None
    bedrooms: Optional[str] = None
    bathrooms: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    timeline: Optional[str] = None
    requirements: Optional[List[str]] = None
    preferred_materials: Optional[str] = None
    additional_requirements: Optional[str] = None
    status: Optional[str] = None


class ProjectOut(BaseModel):
    id: int
    customer_id: int
    location: str
    city: str
    pincode: Optional[str] = None
    property_type: str
    plot_size: Optional[float] = None
    built_up_area: Optional[float] = None
    floors: Optional[str] = None
    bedrooms: Optional[str] = None
    bathrooms: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    timeline: Optional[str] = None
    status: str
    preferred_materials: Optional[str] = None
    additional_requirements: Optional[str] = None
    requirements: List[str] = []
    match_score: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class CustomerProfileOut(BaseModel):
    id: int
    user_id: int
    name: str

    model_config = {"from_attributes": True}


class CustomerProfileUpdate(BaseModel):
    name: Optional[str] = None


class ShortlistRequest(BaseModel):
    builder_id: int

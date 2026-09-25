"""Builder profile schemas."""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class PortfolioImageIn(BaseModel):
    image_url: str


class PortfolioProjectIn(BaseModel):
    name: str
    location: str
    project_type: str
    built_up_area: Optional[float] = None
    project_cost: Optional[float] = None
    completion_year: Optional[int] = None
    description: Optional[str] = None
    images: List[str] = []


class PortfolioProjectOut(BaseModel):
    id: int
    name: str
    location: str
    project_type: str
    built_up_area: Optional[float] = None
    project_cost: Optional[float] = None
    completion_year: Optional[int] = None
    description: Optional[str] = None
    images: List[str] = []

    model_config = {"from_attributes": True}


class BuilderProfileCreate(BaseModel):
    company_name: str = Field(min_length=2, max_length=200)
    contact_person: str
    phone: str
    email: EmailStr
    description: Optional[str] = None
    office_address: Optional[str] = None
    city: str = "Bengaluru"
    pincode: Optional[str] = None
    gst_number: Optional[str] = None
    registration_number: Optional[str] = None
    years_experience: int = 0
    projects_completed: int = 0
    team_size: Optional[int] = None
    service_areas: List[str] = []
    services: List[str] = []
    project_types: List[str] = []
    min_price_per_sqft: Optional[float] = None
    max_price_per_sqft: Optional[float] = None
    min_project_value: Optional[float] = None
    max_project_value: Optional[float] = None
    logo_url: Optional[str] = None
    portfolio: List[PortfolioProjectIn] = []


class BuilderProfileUpdate(BuilderProfileCreate):
    pass


class BuilderProfileOut(BaseModel):
    id: int
    user_id: int
    company_name: str
    contact_person: str
    description: Optional[str] = None
    phone: str
    email: str
    gst_number: Optional[str] = None
    registration_number: Optional[str] = None
    office_address: Optional[str] = None
    city: str
    pincode: Optional[str] = None
    years_experience: int
    projects_completed: int
    team_size: Optional[int] = None
    min_price_per_sqft: Optional[float] = None
    max_price_per_sqft: Optional[float] = None
    min_project_value: Optional[float] = None
    max_project_value: Optional[float] = None
    logo_url: Optional[str] = None
    verification_status: str
    rating: Optional[float] = None
    service_areas: List[str] = []
    services: List[str] = []
    project_types: List[str] = []
    portfolio: List[PortfolioProjectOut] = []
    match_score: Optional[int] = None
    profile_completion: Optional[int] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class BuilderCardOut(BaseModel):
    id: int
    company_name: str
    logo_url: Optional[str] = None
    verification_status: str
    match_score: int
    rating: Optional[float] = None
    years_experience: int
    projects_completed: int
    service_areas: List[str] = []
    min_price_per_sqft: Optional[float] = None
    max_price_per_sqft: Optional[float] = None
    city: str

"""Builder routes."""
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_builder_profile, require_builder
from app.db.session import get_db
from app.models import ConstructionProject, Quote, User
from app.models.builder import BuilderProfile
from app.schemas.builder import BuilderProfileCreate
from app.schemas.quote import QuoteCreate
from app.services.domain import (
    get_builder_by_id,
    load_open_projects,
    serialize_builder,
    serialize_project,
    serialize_quote,
    submit_quote,
    upsert_builder_profile,
)
from app.services.matching_service import matching_service
from app.services.storage import get_storage

router = APIRouter(tags=["builders"])


@router.post("/builders/profile")
def create_or_update_profile(
    payload: BuilderProfileCreate,
    user: User = Depends(require_builder),
    db: Session = Depends(get_db),
):
    builder = upsert_builder_profile(db, user, payload)
    return serialize_builder(builder)


@router.get("/builders/profile")
def get_my_profile(builder: BuilderProfile = Depends(get_builder_profile)):
    return serialize_builder(builder)


@router.put("/builders/profile")
def update_profile(
    payload: BuilderProfileCreate,
    user: User = Depends(require_builder),
    db: Session = Depends(get_db),
):
    builder = upsert_builder_profile(db, user, payload)
    return serialize_builder(builder)


@router.get("/builders/projects/recommended")
def recommended_projects(
    builder: BuilderProfile = Depends(get_builder_profile),
    db: Session = Depends(get_db),
    location: Optional[str] = None,
    property_type: Optional[str] = None,
    min_match: int = 0,
):
    projects = load_open_projects(db)
    ranked = matching_service.rank_projects(builder, projects)
    results = []
    for project, score in ranked:
        if score < min_match:
            continue
        if location and location.lower() not in project.location.lower():
            continue
        if property_type and property_type.lower() != project.property_type.lower():
            continue
        results.append(serialize_project(project, score))
    return results


@router.get("/builders/projects/{project_id}")
def get_project_opportunity(
    project_id: int,
    builder: BuilderProfile = Depends(get_builder_profile),
    db: Session = Depends(get_db),
):
    project = (
        db.query(ConstructionProject)
        .options(joinedload(ConstructionProject.requirements))
        .filter(ConstructionProject.id == project_id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    score = matching_service.score(project, builder)
    return serialize_project(project, score)


@router.post("/builders/projects/{project_id}/quotes")
def create_quote(
    project_id: int,
    payload: QuoteCreate,
    builder: BuilderProfile = Depends(get_builder_profile),
    db: Session = Depends(get_db),
):
    project = (
        db.query(ConstructionProject)
        .options(joinedload(ConstructionProject.requirements))
        .filter(ConstructionProject.id == project_id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    try:
        quote = submit_quote(db, builder, project, payload)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Your quote could not be submitted. Please try again.",
        )
    score = matching_service.score(project, builder)
    quote = (
        db.query(Quote)
        .options(joinedload(Quote.builder))
        .filter(Quote.id == quote.id)
        .one()
    )
    return serialize_quote(quote, score)


@router.get("/builders/quotes")
def my_quotes(
    builder: BuilderProfile = Depends(get_builder_profile),
    db: Session = Depends(get_db),
):
    quotes = (
        db.query(Quote)
        .options(joinedload(Quote.builder), joinedload(Quote.project))
        .filter(Quote.builder_id == builder.id)
        .order_by(Quote.created_at.desc())
        .all()
    )
    return [serialize_quote(q) for q in quotes]


@router.post("/builders/upload")
async def upload_image(
    file: UploadFile = File(...),
    _: BuilderProfile = Depends(get_builder_profile),
):
    storage = get_storage()
    url = storage.save(file.file, file.filename or "image.jpg", file.content_type)
    return {"url": url}


@router.get("/builders/{builder_id}")
def public_builder_profile(builder_id: int, db: Session = Depends(get_db)):
    builder = get_builder_by_id(db, builder_id)
    return serialize_builder(builder)

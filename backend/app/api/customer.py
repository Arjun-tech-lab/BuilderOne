"""Customer and project routes."""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_customer_profile, require_customer
from app.db.session import get_db
from app.models import ConstructionProject, CustomerProfile, Quote, User
from app.schemas.project import (
    CustomerProfileOut,
    CustomerProfileUpdate,
    ProjectCreate,
    ProjectOut,
    ProjectUpdate,
    ShortlistRequest,
)
from app.services.domain import (
    create_project,
    load_builders_for_matching,
    recommend_builders_for_project,
    serialize_builder_card,
    serialize_project,
    serialize_quote,
    shortlist_builder,
    update_project,
)
from app.services.matching_service import matching_service

router = APIRouter(tags=["customer"])


@router.get("/customer/dashboard")
def customer_dashboard(
    project_id: Optional[int] = None,
    profile: CustomerProfile = Depends(get_customer_profile),
    db: Session = Depends(get_db),
):
    """Single round-trip for the customer dashboard (projects + recommendations)."""
    projects = (
        db.query(ConstructionProject)
        .options(joinedload(ConstructionProject.requirements))
        .filter(ConstructionProject.customer_id == profile.id)
        .order_by(ConstructionProject.created_at.desc())
        .all()
    )
    serialized_projects = [serialize_project(p) for p in projects]
    active = None
    if project_id is not None:
        active = next((p for p in projects if p.id == project_id), None)
    if active is None and projects:
        active = projects[0]

    recommended = []
    if active is not None:
        recommended = recommend_builders_for_project(db, active)

    return {
        "projects": serialized_projects,
        "active_project_id": active.id if active else None,
        "recommended_builders": recommended,
    }


@router.get("/customer/profile", response_model=CustomerProfileOut)
def get_profile(profile: CustomerProfile = Depends(get_customer_profile)):
    return CustomerProfileOut.model_validate(profile)


@router.put("/customer/profile", response_model=CustomerProfileOut)
def update_profile(
    payload: CustomerProfileUpdate,
    profile: CustomerProfile = Depends(get_customer_profile),
    user: User = Depends(require_customer),
    db: Session = Depends(get_db),
):
    if payload.name:
        profile.name = payload.name
        user.name = payload.name
    db.commit()
    db.refresh(profile)
    return CustomerProfileOut.model_validate(profile)


@router.post("/projects", response_model=ProjectOut)
def create_project_route(
    payload: ProjectCreate,
    profile: CustomerProfile = Depends(get_customer_profile),
    db: Session = Depends(get_db),
):
    project = create_project(db, profile, payload)
    return serialize_project(project)


@router.get("/projects")
def list_projects(
    profile: CustomerProfile = Depends(get_customer_profile),
    db: Session = Depends(get_db),
):
    projects = (
        db.query(ConstructionProject)
        .options(joinedload(ConstructionProject.requirements))
        .filter(ConstructionProject.customer_id == profile.id)
        .order_by(ConstructionProject.created_at.desc())
        .all()
    )
    return [serialize_project(p) for p in projects]


@router.get("/projects/{project_id}")
def get_project(
    project_id: int,
    profile: CustomerProfile = Depends(get_customer_profile),
    db: Session = Depends(get_db),
):
    project = (
        db.query(ConstructionProject)
        .options(joinedload(ConstructionProject.requirements))
        .filter(
            ConstructionProject.id == project_id,
            ConstructionProject.customer_id == profile.id,
        )
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    return serialize_project(project)


@router.put("/projects/{project_id}")
def update_project_route(
    project_id: int,
    payload: ProjectUpdate,
    profile: CustomerProfile = Depends(get_customer_profile),
    db: Session = Depends(get_db),
):
    project = (
        db.query(ConstructionProject)
        .options(joinedload(ConstructionProject.requirements))
        .filter(
            ConstructionProject.id == project_id,
            ConstructionProject.customer_id == profile.id,
        )
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    updated = update_project(db, project, payload)
    return serialize_project(updated)


@router.get("/projects/{project_id}/recommended-builders")
def recommended_builders(
    project_id: int,
    profile: CustomerProfile = Depends(get_customer_profile),
    db: Session = Depends(get_db),
):
    project = (
        db.query(ConstructionProject)
        .options(joinedload(ConstructionProject.requirements))
        .filter(
            ConstructionProject.id == project_id,
            ConstructionProject.customer_id == profile.id,
        )
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    builders = load_builders_for_matching(db)
    ranked = matching_service.rank_builders(project, builders)
    return [
        serialize_builder_card(b, score)
        for b, score in ranked
        if score >= 40
    ][:12]


@router.get("/projects/{project_id}/quotes")
def list_quotes(
    project_id: int,
    profile: CustomerProfile = Depends(get_customer_profile),
    db: Session = Depends(get_db),
):
    project = (
        db.query(ConstructionProject)
        .options(joinedload(ConstructionProject.requirements))
        .filter(
            ConstructionProject.id == project_id,
            ConstructionProject.customer_id == profile.id,
        )
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    quotes = (
        db.query(Quote)
        .options(joinedload(Quote.builder))
        .filter(Quote.project_id == project_id)
        .all()
    )
    builders_by_id = {b.id: b for b in load_builders_for_matching(db)}
    result = []
    for q in quotes:
        score = None
        if q.builder_id in builders_by_id:
            score = matching_service.score(project, builders_by_id[q.builder_id])
        # Mark viewed
        if q.status == "SUBMITTED":
            q.status = "VIEWED"
        result.append(serialize_quote(q, score))
    db.commit()
    return result


@router.post("/projects/{project_id}/shortlist")
def shortlist(
    project_id: int,
    payload: ShortlistRequest,
    profile: CustomerProfile = Depends(get_customer_profile),
    db: Session = Depends(get_db),
):
    project = (
        db.query(ConstructionProject)
        .filter(
            ConstructionProject.id == project_id,
            ConstructionProject.customer_id == profile.id,
        )
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    item = shortlist_builder(db, project, payload.builder_id)
    return {"id": item.id, "project_id": item.project_id, "builder_id": item.builder_id}

"""Auth and domain service helpers."""
from __future__ import annotations

import json
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.enums import ProjectStatus, QuoteStatus, UserRole, VerificationStatus
from app.core.security import create_access_token, hash_password, verify_password
from app.models import (
    BuilderProfile,
    BuilderProjectType,
    BuilderService,
    BuilderServiceArea,
    BuilderShortlist,
    ConstructionProject,
    CustomerProfile,
    PortfolioImage,
    PortfolioProject,
    ProjectRequirement,
    Quote,
    User,
)
from app.schemas.auth import LoginRequest, RegisterRequest
from app.schemas.builder import BuilderProfileCreate
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.schemas.quote import QuoteCreate
from app.services.matching_service import matching_service


def register_user(db: Session, data: RegisterRequest) -> tuple[User, str]:
    existing = db.query(User).filter(User.email == data.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    user = User(
        name=data.name.strip(),
        email=data.email.lower(),
        phone=data.phone,
        password_hash=hash_password(data.password),
        role=data.role,
    )
    db.add(user)
    db.flush()

    if data.role == UserRole.CUSTOMER.value:
        db.add(CustomerProfile(user_id=user.id, name=data.name.strip()))
    else:
        # Minimal stub so builder can complete onboarding
        db.add(
            BuilderProfile(
                user_id=user.id,
                company_name=f"{data.name.strip()}'s Company",
                contact_person=data.name.strip(),
                phone=data.phone,
                email=data.email.lower(),
                verification_status=VerificationStatus.PENDING.value,
            )
        )

    db.commit()
    db.refresh(user)
    token = create_access_token(str(user.id), user.role)
    return user, token


def login_user(db: Session, data: LoginRequest) -> tuple[User, str]:
    user = db.query(User).filter(User.email == data.email.lower()).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    token = create_access_token(str(user.id), user.role)
    return user, token


def serialize_builder(builder: BuilderProfile, match_score: Optional[int] = None) -> dict:
    missing = []
    if not builder.description:
        missing.append("description")
    if not builder.gst_number:
        missing.append("GST number")
    if not builder.service_areas:
        missing.append("service areas")
    if not builder.services:
        missing.append("services")
    if builder.min_price_per_sqft is None:
        missing.append("pricing")
    # Avoid triggering lazy portfolio load unless already present
    portfolio = []
    has_portfolio = False
    if "portfolio_projects" in builder.__dict__:
        portfolio_projects = builder.portfolio_projects or []
        has_portfolio = len(portfolio_projects) > 0
        portfolio = [
            {
                "id": p.id,
                "name": p.name,
                "location": p.location,
                "project_type": p.project_type,
                "built_up_area": p.built_up_area,
                "project_cost": p.project_cost,
                "completion_year": p.completion_year,
                "description": p.description,
                "images": [i.image_url for i in p.images] if "images" in p.__dict__ else [],
            }
            for p in portfolio_projects
        ]
    if not has_portfolio and "portfolio_projects" in builder.__dict__:
        missing.append("portfolio")
    completion = max(0, 100 - len(missing) * 12)

    return {
        "id": builder.id,
        "user_id": builder.user_id,
        "company_name": builder.company_name,
        "contact_person": builder.contact_person,
        "description": builder.description,
        "phone": builder.phone,
        "email": builder.email,
        "gst_number": builder.gst_number,
        "registration_number": builder.registration_number,
        "office_address": builder.office_address,
        "city": builder.city,
        "pincode": builder.pincode,
        "years_experience": builder.years_experience,
        "projects_completed": builder.projects_completed,
        "team_size": builder.team_size,
        "min_price_per_sqft": builder.min_price_per_sqft,
        "max_price_per_sqft": builder.max_price_per_sqft,
        "min_project_value": builder.min_project_value,
        "max_project_value": builder.max_project_value,
        "logo_url": builder.logo_url,
        "verification_status": builder.verification_status,
        "rating": builder.rating,
        "service_areas": [a.area for a in builder.service_areas],
        "services": [s.service for s in builder.services],
        "project_types": [t.project_type for t in builder.project_types],
        "portfolio": portfolio,
        "match_score": match_score,
        "profile_completion": completion,
        "missing_fields": missing,
        "created_at": builder.created_at,
    }


def serialize_builder_card(
    builder: BuilderProfile, match_score: Optional[int] = None
) -> dict:
    """Lean payload for dashboard / recommendation lists (no portfolio)."""
    return {
        "id": builder.id,
        "user_id": builder.user_id,
        "company_name": builder.company_name,
        "contact_person": builder.contact_person,
        "description": None,
        "phone": builder.phone,
        "email": builder.email,
        "city": builder.city,
        "years_experience": builder.years_experience,
        "projects_completed": builder.projects_completed,
        "min_price_per_sqft": builder.min_price_per_sqft,
        "max_price_per_sqft": builder.max_price_per_sqft,
        "logo_url": builder.logo_url,
        "verification_status": builder.verification_status,
        "rating": builder.rating,
        "service_areas": [a.area for a in builder.service_areas],
        "services": [s.service for s in builder.services],
        "project_types": [t.project_type for t in builder.project_types],
        "portfolio": [],
        "match_score": match_score,
    }


def serialize_project(project: ConstructionProject, match_score: Optional[int] = None) -> dict:
    return {
        "id": project.id,
        "customer_id": project.customer_id,
        "location": project.location,
        "city": project.city,
        "pincode": project.pincode,
        "property_type": project.property_type,
        "plot_size": project.plot_size,
        "built_up_area": project.built_up_area,
        "floors": project.floors,
        "bedrooms": project.bedrooms,
        "bathrooms": project.bathrooms,
        "budget_min": project.budget_min,
        "budget_max": project.budget_max,
        "timeline": project.timeline,
        "status": project.status,
        "preferred_materials": project.preferred_materials,
        "additional_requirements": project.additional_requirements,
        "requirements": [r.requirement for r in project.requirements],
        "match_score": match_score,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
    }


def create_project(db: Session, customer: CustomerProfile, data: ProjectCreate) -> ConstructionProject:
    project = ConstructionProject(
        customer_id=customer.id,
        location=data.location,
        city=data.city,
        pincode=data.pincode,
        property_type=data.property_type,
        plot_size=data.plot_size,
        built_up_area=data.built_up_area,
        floors=data.floors,
        bedrooms=data.bedrooms,
        bathrooms=data.bathrooms,
        budget_min=data.budget_min,
        budget_max=data.budget_max,
        timeline=data.timeline,
        status=data.status or ProjectStatus.OPEN.value,
        preferred_materials=data.preferred_materials,
        additional_requirements=data.additional_requirements,
    )
    db.add(project)
    db.flush()
    for req in data.requirements:
        db.add(ProjectRequirement(project_id=project.id, requirement=req))
    db.commit()
    db.refresh(project)
    return (
        db.query(ConstructionProject)
        .options(joinedload(ConstructionProject.requirements))
        .filter(ConstructionProject.id == project.id)
        .one()
    )


def update_project(
    db: Session, project: ConstructionProject, data: ProjectUpdate
) -> ConstructionProject:
    payload = data.model_dump(exclude_unset=True)
    requirements = payload.pop("requirements", None)
    for key, value in payload.items():
        setattr(project, key, value)
    if requirements is not None:
        project.requirements.clear()
        db.flush()
        for req in requirements:
            db.add(ProjectRequirement(project_id=project.id, requirement=req))
    db.commit()
    return (
        db.query(ConstructionProject)
        .options(joinedload(ConstructionProject.requirements))
        .filter(ConstructionProject.id == project.id)
        .one()
    )


def upsert_builder_profile(
    db: Session, user: User, data: BuilderProfileCreate
) -> BuilderProfile:
    builder = (
        db.query(BuilderProfile)
        .options(
            joinedload(BuilderProfile.service_areas),
            joinedload(BuilderProfile.services),
            joinedload(BuilderProfile.project_types),
            joinedload(BuilderProfile.portfolio_projects).joinedload(PortfolioProject.images),
        )
        .filter(BuilderProfile.user_id == user.id)
        .first()
    )
    if not builder:
        builder = BuilderProfile(user_id=user.id, verification_status=VerificationStatus.PENDING.value)
        db.add(builder)
        db.flush()

    builder.company_name = data.company_name
    builder.contact_person = data.contact_person
    builder.phone = data.phone
    builder.email = data.email
    builder.description = data.description
    builder.office_address = data.office_address
    builder.city = data.city
    builder.pincode = data.pincode
    builder.gst_number = data.gst_number
    builder.registration_number = data.registration_number
    builder.years_experience = data.years_experience
    builder.projects_completed = data.projects_completed
    builder.team_size = data.team_size
    builder.min_price_per_sqft = data.min_price_per_sqft
    builder.max_price_per_sqft = data.max_price_per_sqft
    builder.min_project_value = data.min_project_value
    builder.max_project_value = data.max_project_value
    builder.logo_url = data.logo_url
    # Never auto-verify
    if not builder.verification_status:
        builder.verification_status = VerificationStatus.PENDING.value

    builder.service_areas.clear()
    builder.services.clear()
    builder.project_types.clear()
    db.flush()

    for area in data.service_areas:
        db.add(BuilderServiceArea(builder_id=builder.id, area=area))
    for service in data.services:
        db.add(BuilderService(builder_id=builder.id, service=service))
    for ptype in data.project_types:
        db.add(BuilderProjectType(builder_id=builder.id, project_type=ptype))

    # Replace portfolio if provided
    if data.portfolio is not None:
        for existing in list(builder.portfolio_projects):
            db.delete(existing)
        db.flush()
        for item in data.portfolio:
            pp = PortfolioProject(
                builder_id=builder.id,
                name=item.name,
                location=item.location,
                project_type=item.project_type,
                built_up_area=item.built_up_area,
                project_cost=item.project_cost,
                completion_year=item.completion_year,
                description=item.description,
            )
            db.add(pp)
            db.flush()
            for url in item.images:
                db.add(PortfolioImage(portfolio_project_id=pp.id, image_url=url))

    db.commit()
    return get_builder_by_id(db, builder.id)


def get_builder_by_id(db: Session, builder_id: int) -> BuilderProfile:
    builder = (
        db.query(BuilderProfile)
        .options(
            joinedload(BuilderProfile.service_areas),
            joinedload(BuilderProfile.services),
            joinedload(BuilderProfile.project_types),
            joinedload(BuilderProfile.portfolio_projects).joinedload(PortfolioProject.images),
        )
        .filter(BuilderProfile.id == builder_id)
        .first()
    )
    if not builder:
        raise HTTPException(status_code=404, detail="Builder not found.")
    return builder


def load_builders(db: Session) -> list[BuilderProfile]:
    """Full builder graph including portfolio — use for profile pages only."""
    from sqlalchemy.orm import selectinload

    return (
        db.query(BuilderProfile)
        .options(
            selectinload(BuilderProfile.service_areas),
            selectinload(BuilderProfile.services),
            selectinload(BuilderProfile.project_types),
            selectinload(BuilderProfile.portfolio_projects).selectinload(
                PortfolioProject.images
            ),
        )
        .all()
    )


def load_builders_for_matching(db: Session) -> list[BuilderProfile]:
    """Lean builder load for matching + recommendation cards (no portfolio)."""
    from sqlalchemy.orm import selectinload

    return (
        db.query(BuilderProfile)
        .options(
            selectinload(BuilderProfile.service_areas),
            selectinload(BuilderProfile.services),
            selectinload(BuilderProfile.project_types),
        )
        .all()
    )


def recommend_builders_for_project(
    db: Session, project: ConstructionProject, limit: int = 12, min_score: int = 40
) -> list[dict]:
    builders = load_builders_for_matching(db)
    ranked = matching_service.rank_builders(project, builders)
    return [
        serialize_builder_card(b, score)
        for b, score in ranked
        if score >= min_score
    ][:limit]


def load_open_projects(db: Session) -> list[ConstructionProject]:
    return (
        db.query(ConstructionProject)
        .options(joinedload(ConstructionProject.requirements))
        .filter(
            ConstructionProject.status.in_(
                [
                    ProjectStatus.OPEN.value,
                    ProjectStatus.RECEIVING_QUOTES.value,
                    ProjectStatus.QUOTES_AVAILABLE.value,
                    ProjectStatus.SHORTLISTED.value,
                ]
            )
        )
        .all()
    )


def submit_quote(
    db: Session, builder: BuilderProfile, project: ConstructionProject, data: QuoteCreate
) -> Quote:
    existing = (
        db.query(Quote)
        .filter(Quote.project_id == project.id, Quote.builder_id == builder.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="You have already submitted a quote for this project.")

    quote = Quote(
        project_id=project.id,
        builder_id=builder.id,
        proposed_cost=data.proposed_cost,
        rate_per_sqft=data.rate_per_sqft,
        estimated_duration=data.estimated_duration,
        package_type=data.package_type,
        proposal_description=data.proposal_description,
        included_services=json.dumps(data.included_services),
        excluded_services=data.excluded_services,
        warranty_years=data.warranty_years,
        payment_terms=data.payment_terms,
        status=QuoteStatus.SUBMITTED.value,
    )
    db.add(quote)
    if project.status == ProjectStatus.OPEN.value:
        project.status = ProjectStatus.RECEIVING_QUOTES.value
    elif project.status == ProjectStatus.RECEIVING_QUOTES.value:
        count = db.query(Quote).filter(Quote.project_id == project.id).count()
        if count >= 1:
            project.status = ProjectStatus.QUOTES_AVAILABLE.value
    db.commit()
    db.refresh(quote)
    return quote


def serialize_quote(quote: Quote, match_score: Optional[int] = None) -> dict:
    services: list[str] = []
    if quote.included_services:
        try:
            services = json.loads(quote.included_services)
        except json.JSONDecodeError:
            services = [quote.included_services]
    builder = quote.builder
    return {
        "id": quote.id,
        "project_id": quote.project_id,
        "builder_id": quote.builder_id,
        "proposed_cost": quote.proposed_cost,
        "rate_per_sqft": quote.rate_per_sqft,
        "estimated_duration": quote.estimated_duration,
        "package_type": quote.package_type,
        "proposal_description": quote.proposal_description,
        "included_services": services,
        "excluded_services": quote.excluded_services,
        "warranty_years": quote.warranty_years,
        "payment_terms": quote.payment_terms,
        "status": quote.status,
        "created_at": quote.created_at,
        "builder_name": builder.company_name if builder else None,
        "builder_years_experience": builder.years_experience if builder else None,
        "builder_projects_completed": builder.projects_completed if builder else None,
        "logo_url": builder.logo_url if builder else None,
        "match_score": match_score,
    }


def shortlist_builder(
    db: Session, project: ConstructionProject, builder_id: int
) -> BuilderShortlist:
    builder = db.query(BuilderProfile).filter(BuilderProfile.id == builder_id).first()
    if not builder:
        raise HTTPException(status_code=404, detail="Builder not found.")

    existing = (
        db.query(BuilderShortlist)
        .filter(
            BuilderShortlist.project_id == project.id,
            BuilderShortlist.builder_id == builder_id,
        )
        .first()
    )
    if existing:
        return existing

    shortlist = BuilderShortlist(project_id=project.id, builder_id=builder_id)
    db.add(shortlist)

    quote = (
        db.query(Quote)
        .filter(Quote.project_id == project.id, Quote.builder_id == builder_id)
        .first()
    )
    if quote:
        quote.status = QuoteStatus.SHORTLISTED.value

    project.status = ProjectStatus.SHORTLISTED.value
    db.commit()
    db.refresh(shortlist)
    return shortlist

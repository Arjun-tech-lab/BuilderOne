"""
Demo seed data for BuilderOne investor MVP.

Run:  python -m scripts.seed
Or set SEED_ON_STARTUP=true (default for local demo).

Demo accounts:
  Customer: customer@demo.builderone.in / Demo@1234
  Builder:  whitefield@demo.builderone.in / Demo@1234  (and other builders)
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

# Allow running as module from backend/
BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))
VENDOR = BACKEND_ROOT / "vendor"
if VENDOR.exists():
    sys.path.insert(0, str(VENDOR))

from sqlalchemy.orm import Session

from app.core.enums import ProjectStatus, QuoteStatus, UserRole, VerificationStatus
from app.core.security import hash_password
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models import (
    BuilderProfile,
    BuilderProjectType,
    BuilderService,
    BuilderServiceArea,
    ConstructionProject,
    CustomerProfile,
    PortfolioImage,
    PortfolioProject,
    ProjectRequirement,
    Quote,
    User,
)

DEMO_PASSWORD = "Demo@1234"

# Unsplash construction / home imagery (public CDN URLs for demo)
IMG = {
    "home1": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    "home2": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    "home3": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    "home4": "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    "home5": "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
    "home6": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
    "logo": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=200&q=80",
}

BUILDERS = [
    {
        "email": "whitefield@demo.builderone.in",
        "name": "Ravi Krishnan",
        "phone": "9876501001",
        "company_name": "Whitefield Habitat Builders",
        "city": "Bengaluru",
        "pincode": "560066",
        "office_address": "ITPL Main Road, Whitefield",
        "description": "Specialists in independent homes and villas across East Bengaluru. Known for transparent pricing and on-time delivery.",
        "years_experience": 12,
        "projects_completed": 86,
        "team_size": 45,
        "gst_number": "29AABCW1234A1Z5",
        "min_price_per_sqft": 2100,
        "max_price_per_sqft": 2800,
        "min_project_value": 35_00_000,
        "max_project_value": 2_50_00_000,
        "rating": 4.7,
        "areas": ["Whitefield", "Marathahalli", "Varthur", "Sarjapur"],
        "services": ["Turnkey construction", "Civil construction", "Architecture", "Solar", "Interior"],
        "types": ["Independent houses", "Villas", "Duplexes"],
        "portfolio": [
            {
                "name": "Palm Grove Residence",
                "location": "Whitefield",
                "project_type": "Independent House",
                "built_up_area": 2200,
                "project_cost": 52_00_000,
                "completion_year": 2024,
                "description": "G+1 independent home with solar and landscaped courtyard.",
                "images": [IMG["home1"], IMG["home2"]],
            }
        ],
    },
    {
        "email": "sarjapur@demo.builderone.in",
        "name": "Anitha Rao",
        "phone": "9876501002",
        "company_name": "Sarjapur Nest Constructions",
        "city": "Bengaluru",
        "pincode": "560035",
        "office_address": "Sarjapur Main Road",
        "description": "Premium villa and duplex builders serving Southeast Bengaluru corridors.",
        "years_experience": 9,
        "projects_completed": 54,
        "team_size": 32,
        "gst_number": "29AABCS5678B1Z2",
        "min_price_per_sqft": 2300,
        "max_price_per_sqft": 3200,
        "min_project_value": 45_00_000,
        "max_project_value": 3_50_00_000,
        "rating": 4.6,
        "areas": ["Sarjapur", "Electronic City", "HSR Layout", "Bellandur"],
        "services": ["Turnkey construction", "Architecture", "Interior", "Landscaping", "Electrical"],
        "types": ["Villas", "Duplexes", "Independent houses"],
        "portfolio": [
            {
                "name": "Lakeview Villa",
                "location": "Sarjapur",
                "project_type": "Villa",
                "built_up_area": 3200,
                "project_cost": 95_00_000,
                "completion_year": 2023,
                "description": "Contemporary villa with open courtyard.",
                "images": [IMG["home3"], IMG["home4"]],
            }
        ],
    },
    {
        "email": "hsr@demo.builderone.in",
        "name": "Karthik Menon",
        "phone": "9876501003",
        "company_name": "HSR Urban Homes",
        "city": "Bengaluru",
        "pincode": "560102",
        "office_address": "27th Main, HSR Layout",
        "description": "Compact luxury homes for HSR, Koramangala and surrounding neighbourhoods.",
        "years_experience": 8,
        "projects_completed": 41,
        "team_size": 28,
        "gst_number": "29AABCH9012C1Z8",
        "min_price_per_sqft": 2400,
        "max_price_per_sqft": 3100,
        "min_project_value": 40_00_000,
        "max_project_value": 2_00_00_000,
        "rating": 4.5,
        "areas": ["HSR Layout", "Koramangala", "BTM Layout", "JP Nagar"],
        "services": ["Turnkey construction", "Civil construction", "Interior", "Plumbing", "Electrical"],
        "types": ["Independent houses", "Duplexes"],
        "portfolio": [
            {
                "name": "Sector 2 Duplex",
                "location": "HSR Layout",
                "project_type": "Duplex",
                "built_up_area": 1800,
                "project_cost": 48_00_000,
                "completion_year": 2024,
                "description": "City duplex with rooftop seating.",
                "images": [IMG["home5"]],
            }
        ],
    },
    {
        "email": "ecity@demo.builderone.in",
        "name": "Suresh Naidu",
        "phone": "9876501004",
        "company_name": "E-City Foundation Works",
        "city": "Bengaluru",
        "pincode": "560100",
        "office_address": "Electronic City Phase 1",
        "description": "Value-focused turnkey construction for South Bengaluru plots.",
        "years_experience": 15,
        "projects_completed": 120,
        "team_size": 60,
        "gst_number": "29AABCE3456D1Z1",
        "min_price_per_sqft": 1850,
        "max_price_per_sqft": 2400,
        "min_project_value": 25_00_000,
        "max_project_value": 1_50_00_000,
        "rating": 4.3,
        "areas": ["Electronic City", "Bommanahalli", "Bannerghatta Road", "JP Nagar"],
        "services": ["Turnkey construction", "Civil construction", "Electrical", "Plumbing", "Painting"],
        "types": ["Independent houses", "Duplexes", "Renovation"],
        "portfolio": [
            {
                "name": "Phase 2 Family Home",
                "location": "Electronic City",
                "project_type": "Independent House",
                "built_up_area": 1600,
                "project_cost": 34_00_000,
                "completion_year": 2022,
                "description": "Efficient G+1 for a growing family.",
                "images": [IMG["home6"]],
            }
        ],
    },
    {
        "email": "yelahanka@demo.builderone.in",
        "name": "Priya Sharma",
        "phone": "9876501005",
        "company_name": "Yelahanka Skyline Builders",
        "city": "Bengaluru",
        "pincode": "560064",
        "office_address": "Yelahanka New Town",
        "description": "North Bengaluru specialists with strong villa portfolio near the airport corridor.",
        "years_experience": 11,
        "projects_completed": 67,
        "team_size": 38,
        "gst_number": "29AABCY7890E1Z4",
        "min_price_per_sqft": 2000,
        "max_price_per_sqft": 2700,
        "min_project_value": 30_00_000,
        "max_project_value": 2_80_00_000,
        "rating": 4.4,
        "areas": ["Yelahanka", "Hebbal", "Devanahalli", "Jakkur"],
        "services": ["Turnkey construction", "Architecture", "Solar", "Landscaping", "Interior"],
        "types": ["Independent houses", "Villas"],
        "portfolio": [
            {
                "name": "Airport Road Villa",
                "location": "Yelahanka",
                "project_type": "Villa",
                "built_up_area": 2800,
                "project_cost": 72_00_000,
                "completion_year": 2023,
                "description": "Spacious villa with rainwater harvesting.",
                "images": [IMG["home2"], IMG["home3"]],
            }
        ],
    },
    {
        "email": "hebbal@demo.builderone.in",
        "name": "Mohammed Irfan",
        "phone": "9876501006",
        "company_name": "Hebbal Crest Constructions",
        "city": "Bengaluru",
        "pincode": "560024",
        "office_address": "Hebbal Flyover Junction",
        "description": "Reliable residential builders for Hebbal, Thanisandra and nearby localities.",
        "years_experience": 7,
        "projects_completed": 33,
        "team_size": 22,
        "gst_number": "29AABCH2345F1Z7",
        "min_price_per_sqft": 1950,
        "max_price_per_sqft": 2600,
        "min_project_value": 28_00_000,
        "max_project_value": 1_80_00_000,
        "rating": 4.2,
        "areas": ["Hebbal", "Yelahanka", "RT Nagar", "Sahakarnagar"],
        "services": ["Civil construction", "Turnkey construction", "Electrical", "Plumbing"],
        "types": ["Independent houses", "Duplexes"],
        "portfolio": [
            {
                "name": "Thanisandra Corner Home",
                "location": "Hebbal",
                "project_type": "Independent House",
                "built_up_area": 1900,
                "project_cost": 42_00_000,
                "completion_year": 2024,
                "description": "Corner plot G+1 with car porch.",
                "images": [IMG["home1"]],
            }
        ],
    },
    {
        "email": "jpnagar@demo.builderone.in",
        "name": "Deepa Iyer",
        "phone": "9876501007",
        "company_name": "JP Nagar Heritage Homes",
        "city": "Bengaluru",
        "pincode": "560078",
        "office_address": "15th Cross, JP Nagar",
        "description": "Craft-focused homes blending traditional materials with modern layouts.",
        "years_experience": 14,
        "projects_completed": 78,
        "team_size": 40,
        "gst_number": "29AABCJ6789G1Z0",
        "min_price_per_sqft": 2200,
        "max_price_per_sqft": 3000,
        "min_project_value": 38_00_000,
        "max_project_value": 2_20_00_000,
        "rating": 4.8,
        "areas": ["JP Nagar", "Jayanagar", "Banashankari", "Bannerghatta Road"],
        "services": ["Turnkey construction", "Architecture", "Interior", "Solar", "Landscaping"],
        "types": ["Independent houses", "Villas", "Duplexes"],
        "portfolio": [
            {
                "name": "4th Phase Courtyard House",
                "location": "JP Nagar",
                "project_type": "Independent House",
                "built_up_area": 2400,
                "project_cost": 58_00_000,
                "completion_year": 2023,
                "description": "Courtyard-centric home with modular kitchen.",
                "images": [IMG["home4"], IMG["home5"]],
            }
        ],
    },
    {
        "email": "bannerghatta@demo.builderone.in",
        "name": "Vikram Shetty",
        "phone": "9876501008",
        "company_name": "Bannerghatta BuildCraft",
        "city": "Bengaluru",
        "pincode": "560076",
        "office_address": "Bannerghatta Main Road",
        "description": "End-to-end residential construction along Bannerghatta and Arekere.",
        "years_experience": 10,
        "projects_completed": 59,
        "team_size": 35,
        "gst_number": "29AABCB0123H1Z3",
        "min_price_per_sqft": 2050,
        "max_price_per_sqft": 2750,
        "min_project_value": 32_00_000,
        "max_project_value": 2_40_00_000,
        "rating": 4.5,
        "areas": ["Bannerghatta Road", "JP Nagar", "Electronic City", "Arekere"],
        "services": ["Turnkey construction", "Civil construction", "Solar", "Electrical", "Interior"],
        "types": ["Independent houses", "Villas", "Duplexes"],
        "portfolio": [
            {
                "name": "Arekere Garden Home",
                "location": "Bannerghatta Road",
                "project_type": "Independent House",
                "built_up_area": 2100,
                "project_cost": 49_00_000,
                "completion_year": 2024,
                "description": "Garden-facing G+1 with solar rooftop.",
                "images": [IMG["home6"], IMG["home1"]],
            }
        ],
    },
]


def seed_builders(db: Session) -> list[BuilderProfile]:
    created = []
    for data in BUILDERS:
        existing = db.query(User).filter(User.email == data["email"]).first()
        if existing:
            created.append(existing.builder_profile)
            continue

        user = User(
            name=data["name"],
            email=data["email"],
            phone=data["phone"],
            password_hash=hash_password(DEMO_PASSWORD),
            role=UserRole.BUILDER.value,
        )
        db.add(user)
        db.flush()

        builder = BuilderProfile(
            user_id=user.id,
            company_name=data["company_name"],
            contact_person=data["name"],
            description=data["description"],
            phone=data["phone"],
            email=data["email"],
            gst_number=data["gst_number"],
            office_address=data["office_address"],
            city=data["city"],
            pincode=data["pincode"],
            years_experience=data["years_experience"],
            projects_completed=data["projects_completed"],
            team_size=data["team_size"],
            min_price_per_sqft=data["min_price_per_sqft"],
            max_price_per_sqft=data["max_price_per_sqft"],
            min_project_value=data["min_project_value"],
            max_project_value=data["max_project_value"],
            logo_url=IMG["logo"],
            verification_status=VerificationStatus.PENDING.value,
            rating=data["rating"],
        )
        db.add(builder)
        db.flush()

        for area in data["areas"]:
            db.add(BuilderServiceArea(builder_id=builder.id, area=area))
        for service in data["services"]:
            db.add(BuilderService(builder_id=builder.id, service=service))
        for ptype in data["types"]:
            db.add(BuilderProjectType(builder_id=builder.id, project_type=ptype))

        for item in data["portfolio"]:
            pp = PortfolioProject(
                builder_id=builder.id,
                name=item["name"],
                location=item["location"],
                project_type=item["project_type"],
                built_up_area=item["built_up_area"],
                project_cost=item["project_cost"],
                completion_year=item["completion_year"],
                description=item["description"],
            )
            db.add(pp)
            db.flush()
            for url in item["images"]:
                db.add(PortfolioImage(portfolio_project_id=pp.id, image_url=url))

        created.append(builder)
    db.commit()
    return created


def seed_customer_and_demo_project(db: Session, builders: list[BuilderProfile]) -> None:
    email = "customer@demo.builderone.in"
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            name="Arjun Mehta",
            email=email,
            phone="9876512345",
            password_hash=hash_password(DEMO_PASSWORD),
            role=UserRole.CUSTOMER.value,
        )
        db.add(user)
        db.flush()
        profile = CustomerProfile(user_id=user.id, name="Arjun Mehta")
        db.add(profile)
        db.flush()
    else:
        profile = user.customer_profile

    existing_project = (
        db.query(ConstructionProject)
        .filter(ConstructionProject.customer_id == profile.id)
        .first()
    )
    if existing_project:
        return

    project = ConstructionProject(
        customer_id=profile.id,
        location="Whitefield",
        city="Bengaluru",
        pincode="560066",
        property_type="Independent House",
        plot_size=2400,
        built_up_area=2000,
        floors="G + 1",
        bedrooms="3",
        bathrooms="3",
        budget_min=45_00_000,
        budget_max=55_00_000,
        timeline="9–12 months",
        status=ProjectStatus.QUOTES_AVAILABLE.value,
        preferred_materials="Premium tiles, branded electrical fittings, UPVC windows",
        additional_requirements="Prefer east-facing living room and solar rooftop readiness.",
    )
    db.add(project)
    db.flush()
    for req in ["Turnkey construction", "Solar installation", "Electrical"]:
        db.add(ProjectRequirement(project_id=project.id, requirement=req))

    # Seed 3 demo quotes for comparison
    quote_specs = [
        (0, 49_00_000, 2450, 9, "PREMIUM"),
        (1, 51_00_000, 2550, 10, "PREMIUM"),
        (2, 47_00_000, 2350, 11, "STANDARD"),
    ]
    for idx, cost, rate, months, package in quote_specs:
        if idx >= len(builders) or builders[idx] is None:
            continue
        b = builders[idx]
        db.add(
            Quote(
                project_id=project.id,
                builder_id=b.id,
                proposed_cost=cost,
                rate_per_sqft=rate,
                estimated_duration=months,
                package_type=package,
                proposal_description=f"Complete turnkey proposal from {b.company_name} including solar readiness.",
                included_services=json.dumps(
                    ["Turnkey construction", "Electrical", "Plumbing", "Painting"]
                ),
                excluded_services="Modular kitchen appliances, soft furnishings",
                warranty_years=5,
                payment_terms="30% advance, 40% at structure, 25% at finishing, 5% on handover",
                status=QuoteStatus.SUBMITTED.value,
            )
        )
    db.commit()


def run_seed(reset: bool = False) -> None:
    if reset:
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        builders = seed_builders(db)
        # Refresh builders list
        builders = db.query(BuilderProfile).order_by(BuilderProfile.id).all()
        seed_customer_and_demo_project(db, builders)
        print("Seed complete.")
        print("  Customer: customer@demo.builderone.in / Demo@1234")
        print("  Builder:  whitefield@demo.builderone.in / Demo@1234")
    finally:
        db.close()


if __name__ == "__main__":
    run_seed(reset="--reset" in sys.argv)

"""Builder profile, services, areas, and portfolio models."""
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import VerificationStatus
from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.quote import Quote
    from app.models.user import User


class BuilderProfile(Base, TimestampMixin):
    __tablename__ = "builder_profiles"
    __table_args__ = (
        Index("ix_builder_profiles_city", "city"),
        Index("ix_builder_profiles_verification_status", "verification_status"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    company_name: Mapped[str] = mapped_column(String(200), nullable=False)
    contact_person: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    gst_number: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    registration_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    office_address: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    city: Mapped[str] = mapped_column(String(100), default="Bengaluru")
    pincode: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    years_experience: Mapped[int] = mapped_column(Integer, default=0)
    projects_completed: Mapped[int] = mapped_column(Integer, default=0)
    team_size: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    min_price_per_sqft: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    max_price_per_sqft: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    min_project_value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    max_project_value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    logo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    verification_status: Mapped[str] = mapped_column(
        String(20), default=VerificationStatus.PENDING.value
    )
    # Demo rating placeholder — replace with real reviews module later
    rating: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    user: Mapped["User"] = relationship(back_populates="builder_profile")
    service_areas: Mapped[list["BuilderServiceArea"]] = relationship(
        back_populates="builder", cascade="all, delete-orphan"
    )
    services: Mapped[list["BuilderService"]] = relationship(
        back_populates="builder", cascade="all, delete-orphan"
    )
    project_types: Mapped[list["BuilderProjectType"]] = relationship(
        back_populates="builder", cascade="all, delete-orphan"
    )
    portfolio_projects: Mapped[list["PortfolioProject"]] = relationship(
        back_populates="builder", cascade="all, delete-orphan"
    )
    quotes: Mapped[list["Quote"]] = relationship(back_populates="builder")


class BuilderServiceArea(Base):
    __tablename__ = "builder_service_areas"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    builder_id: Mapped[int] = mapped_column(ForeignKey("builder_profiles.id", ondelete="CASCADE"))
    area: Mapped[str] = mapped_column(String(120), nullable=False)

    builder: Mapped["BuilderProfile"] = relationship(back_populates="service_areas")


class BuilderService(Base):
    __tablename__ = "builder_services"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    builder_id: Mapped[int] = mapped_column(ForeignKey("builder_profiles.id", ondelete="CASCADE"))
    service: Mapped[str] = mapped_column(String(120), nullable=False)

    builder: Mapped["BuilderProfile"] = relationship(back_populates="services")


class BuilderProjectType(Base):
    __tablename__ = "builder_project_types"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    builder_id: Mapped[int] = mapped_column(ForeignKey("builder_profiles.id", ondelete="CASCADE"))
    project_type: Mapped[str] = mapped_column(String(80), nullable=False)

    builder: Mapped["BuilderProfile"] = relationship(back_populates="project_types")


class PortfolioProject(Base, TimestampMixin):
    __tablename__ = "portfolio_projects"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    builder_id: Mapped[int] = mapped_column(ForeignKey("builder_profiles.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    location: Mapped[str] = mapped_column(String(200), nullable=False)
    project_type: Mapped[str] = mapped_column(String(80), nullable=False)
    built_up_area: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    project_cost: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    completion_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    builder: Mapped["BuilderProfile"] = relationship(back_populates="portfolio_projects")
    images: Mapped[list["PortfolioImage"]] = relationship(
        back_populates="portfolio_project", cascade="all, delete-orphan"
    )


class PortfolioImage(Base):
    __tablename__ = "portfolio_images"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    portfolio_project_id: Mapped[int] = mapped_column(
        ForeignKey("portfolio_projects.id", ondelete="CASCADE")
    )
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)

    portfolio_project: Mapped["PortfolioProject"] = relationship(back_populates="images")

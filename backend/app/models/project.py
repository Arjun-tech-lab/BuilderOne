"""Construction project models."""
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import ProjectStatus
from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.quote import BuilderShortlist, Quote
    from app.models.user import CustomerProfile


class ConstructionProject(Base, TimestampMixin):
    __tablename__ = "construction_projects"
    __table_args__ = (
        Index("ix_construction_projects_location", "location"),
        Index("ix_construction_projects_status", "status"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customer_profiles.id", ondelete="CASCADE"))
    location: Mapped[str] = mapped_column(String(120), nullable=False)
    city: Mapped[str] = mapped_column(String(100), default="Bengaluru")
    pincode: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    property_type: Mapped[str] = mapped_column(String(80), nullable=False)
    plot_size: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    built_up_area: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    floors: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)
    bedrooms: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    bathrooms: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    budget_min: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    budget_max: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    timeline: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)
    status: Mapped[str] = mapped_column(String(40), default=ProjectStatus.DRAFT.value)
    preferred_materials: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    additional_requirements: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    customer: Mapped["CustomerProfile"] = relationship(back_populates="projects")
    requirements: Mapped[list["ProjectRequirement"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    quotes: Mapped[list["Quote"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    shortlists: Mapped[list["BuilderShortlist"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )


class ProjectRequirement(Base):
    __tablename__ = "project_requirements"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("construction_projects.id", ondelete="CASCADE")
    )
    requirement: Mapped[str] = mapped_column(String(120), nullable=False)

    project: Mapped["ConstructionProject"] = relationship(back_populates="requirements")

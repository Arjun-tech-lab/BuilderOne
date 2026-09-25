"""Quote and shortlist models.

TODO: Future tender/reverse-auction extension points
- Tender, TenderParticipant, Bid tables can hang off construction_projects
- Quote can evolve into a Bid with timestamp + competitive ranking
"""
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Float, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import QuoteStatus
from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.builder import BuilderProfile
    from app.models.project import ConstructionProject


class Quote(Base, TimestampMixin):
    __tablename__ = "quotes"
    __table_args__ = (
        Index("ix_quotes_project_id", "project_id"),
        Index("ix_quotes_builder_id", "builder_id"),
        UniqueConstraint("project_id", "builder_id", name="uq_quote_project_builder"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("construction_projects.id", ondelete="CASCADE")
    )
    builder_id: Mapped[int] = mapped_column(
        ForeignKey("builder_profiles.id", ondelete="CASCADE")
    )
    proposed_cost: Mapped[float] = mapped_column(Float, nullable=False)
    rate_per_sqft: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    estimated_duration: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    package_type: Mapped[str] = mapped_column(String(20), default="STANDARD")
    proposal_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    included_services: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON list as string
    excluded_services: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    warranty_years: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    payment_terms: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default=QuoteStatus.SUBMITTED.value)

    project: Mapped["ConstructionProject"] = relationship(back_populates="quotes")
    builder: Mapped["BuilderProfile"] = relationship(back_populates="quotes")


class BuilderShortlist(Base, TimestampMixin):
    __tablename__ = "builder_shortlists"
    __table_args__ = (
        UniqueConstraint("project_id", "builder_id", name="uq_shortlist_project_builder"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("construction_projects.id", ondelete="CASCADE")
    )
    builder_id: Mapped[int] = mapped_column(
        ForeignKey("builder_profiles.id", ondelete="CASCADE")
    )

    project: Mapped["ConstructionProject"] = relationship(back_populates="shortlists")

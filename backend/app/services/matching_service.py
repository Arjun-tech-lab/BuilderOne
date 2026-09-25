"""
Deterministic builder–project matching engine.

Score breakdown (max 100):
  Location compatibility   0–25
  Budget compatibility     0–20
  Property/project type    0–20
  Built-up/project size    0–15
  Timeline                 0–10
  Service requirements     0–10

TODO: Replace with AI/ML recommendation engine without changing API contract.
The MatchingService.score() interface should remain stable.
"""
from __future__ import annotations

from typing import Optional, Sequence

from app.models.builder import BuilderProfile
from app.models.project import ConstructionProject


# Approximate timeline ordering for soft matching
TIMELINE_ORDER = {
    "Within 6 months": 1,
    "6–9 months": 2,
    "9–12 months": 3,
    "12–18 months": 4,
    "Flexible": 3,
}

PROPERTY_ALIASES = {
    "Independent House": ["Independent houses", "Independent House", "Independent homes"],
    "Villa": ["Villas", "Villa"],
    "Duplex": ["Duplexes", "Duplex"],
    "Other": ["Renovation", "Other"],
}

SERVICE_ALIASES = {
    "Turnkey construction": ["Turnkey construction", "Turnkey"],
    "Civil construction": ["Civil construction", "Civil"],
    "Architecture + construction": ["Architecture", "Architecture + construction"],
    "Interior work": ["Interior", "Interior work"],
    "Electrical": ["Electrical"],
    "Plumbing": ["Plumbing"],
    "Painting": ["Painting"],
    "Landscaping": ["Landscaping"],
    "Solar installation": ["Solar", "Solar installation"],
    "Rainwater harvesting": ["Rainwater harvesting", "Other"],
    "Modular kitchen": ["Interior", "Modular kitchen", "Other"],
    "False ceiling": ["Interior", "False ceiling", "Other"],
    "Other": ["Other"],
}


class MatchingService:
    """Pure scoring logic — no DB access. Easy to swap for ML later."""

    def score(self, project: ConstructionProject, builder: BuilderProfile) -> int:
        total = 0
        total += self._location_score(project, builder)
        total += self._budget_score(project, builder)
        total += self._property_type_score(project, builder)
        total += self._size_score(project, builder)
        total += self._timeline_score(project, builder)
        total += self._service_score(project, builder)
        return max(0, min(100, int(round(total))))

    def rank_builders(
        self, project: ConstructionProject, builders: Sequence[BuilderProfile]
    ) -> list[tuple[BuilderProfile, int]]:
        scored = [(b, self.score(project, b)) for b in builders]
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored

    def rank_projects(
        self, builder: BuilderProfile, projects: Sequence[ConstructionProject]
    ) -> list[tuple[ConstructionProject, int]]:
        scored = [(p, self.score(p, builder)) for p in projects]
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored

    def _location_score(self, project: ConstructionProject, builder: BuilderProfile) -> float:
        areas = {a.area.lower().strip() for a in builder.service_areas}
        loc = (project.location or "").lower().strip()
        if not areas:
            return 8  # partial credit if areas not set
        if loc in areas:
            return 25
        # Partial match on city
        if project.city and builder.city and project.city.lower() == builder.city.lower():
            return 12
        return 4

    def _budget_score(self, project: ConstructionProject, builder: BuilderProfile) -> float:
        if project.budget_min is None and project.budget_max is None:
            return 10
        bmin = builder.min_project_value
        bmax = builder.max_project_value
        pmin = project.budget_min or 0
        pmax = project.budget_max or pmin

        if bmin is None and bmax is None:
            # Fall back to sqft pricing estimate
            if builder.min_price_per_sqft and project.built_up_area:
                est_min = builder.min_price_per_sqft * project.built_up_area
                est_max = (builder.max_price_per_sqft or builder.min_price_per_sqft) * project.built_up_area
                bmin, bmax = est_min, est_max
            else:
                return 10

        bmin = bmin or 0
        bmax = bmax or bmin * 2

        # Overlap of ranges
        overlap_start = max(pmin, bmin)
        overlap_end = min(pmax, bmax)
        if overlap_end >= overlap_start:
            return 20
        # Near miss
        gap = min(abs(pmin - bmax), abs(bmin - pmax))
        if gap < 500_000:
            return 12
        if gap < 1_500_000:
            return 6
        return 2

    def _property_type_score(self, project: ConstructionProject, builder: BuilderProfile) -> float:
        types = {t.project_type.lower() for t in builder.project_types}
        if not types:
            return 8
        aliases = PROPERTY_ALIASES.get(project.property_type, [project.property_type])
        for alias in aliases:
            if alias.lower() in types or project.property_type.lower() in types:
                return 20
        return 4

    def _size_score(self, project: ConstructionProject, builder: BuilderProfile) -> float:
        area = project.built_up_area
        if not area:
            return 8
        # Prefer builders whose typical price band implies similar project scale
        if builder.min_price_per_sqft and builder.max_project_value:
            max_area = builder.max_project_value / max(builder.min_price_per_sqft, 1)
            min_area = (builder.min_project_value or 0) / max(
                builder.max_price_per_sqft or builder.min_price_per_sqft, 1
            )
            if min_area <= area <= max_area * 1.2:
                return 15
            if abs(area - (min_area + max_area) / 2) / max(area, 1) < 0.4:
                return 10
            return 5
        # Soft scoring by portfolio only if already eager-loaded (avoid N+1)
        if "portfolio_projects" in builder.__dict__ and builder.portfolio_projects:
            areas = [p.built_up_area for p in builder.portfolio_projects if p.built_up_area]
            if areas:
                avg = sum(areas) / len(areas)
                diff = abs(avg - area) / max(area, 1)
                if diff < 0.2:
                    return 15
                if diff < 0.4:
                    return 10
                return 6
        return 8

    def _timeline_score(self, project: ConstructionProject, builder: BuilderProfile) -> float:
        # MVP: builders with more experience score slightly higher on tight timelines
        if not project.timeline:
            return 6
        order = TIMELINE_ORDER.get(project.timeline, 3)
        if order <= 2 and builder.years_experience >= 8:
            return 10
        if order <= 2 and builder.years_experience >= 4:
            return 7
        if project.timeline == "Flexible":
            return 10
        return 7

    def _service_score(self, project: ConstructionProject, builder: BuilderProfile) -> float:
        reqs = [r.requirement for r in project.requirements]
        if not reqs:
            return 6
        builder_services = {s.service.lower() for s in builder.services}
        if not builder_services:
            return 3
        matched = 0
        for req in reqs:
            aliases = SERVICE_ALIASES.get(req, [req])
            if any(a.lower() in builder_services for a in aliases):
                matched += 1
        ratio = matched / len(reqs)
        return round(10 * ratio)


matching_service = MatchingService()

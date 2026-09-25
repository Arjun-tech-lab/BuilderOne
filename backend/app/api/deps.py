"""FastAPI dependency injection for auth and DB."""
from typing import Generator, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session, joinedload

from app.core.enums import UserRole
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models import BuilderProfile, CustomerProfile, User

security = HTTPBearer(auto_error=False)


def get_current_user(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if not creds:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")
    try:
        payload = decode_access_token(creds.credentials)
        user_id = int(payload["sub"])
    except (ValueError, KeyError, TypeError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")
    return user


def require_customer(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.CUSTOMER.value:
        raise HTTPException(status_code=403, detail="Customer access required.")
    return user


def require_builder(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.BUILDER.value:
        raise HTTPException(status_code=403, detail="Builder access required.")
    return user


def get_customer_profile(
    user: User = Depends(require_customer), db: Session = Depends(get_db)
) -> CustomerProfile:
    # Do not eager-load all projects here — callers query what they need.
    profile = (
        db.query(CustomerProfile)
        .filter(CustomerProfile.user_id == user.id)
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Customer profile not found.")
    return profile


def get_builder_profile(
    user: User = Depends(require_builder), db: Session = Depends(get_db)
) -> BuilderProfile:
    from app.models.builder import PortfolioProject

    profile = (
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
    if not profile:
        raise HTTPException(status_code=404, detail="Builder profile not found.")
    return profile

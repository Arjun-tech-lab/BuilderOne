"""Shared enums for BuilderOne domain models."""
import enum


class UserRole(str, enum.Enum):
    CUSTOMER = "CUSTOMER"
    BUILDER = "BUILDER"
    # TODO: ADMIN portal — extend role-based access for verification & moderation
    ADMIN = "ADMIN"


class VerificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"


class ProjectStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    OPEN = "OPEN"
    RECEIVING_QUOTES = "RECEIVING_QUOTES"
    QUOTES_AVAILABLE = "QUOTES_AVAILABLE"
    SHORTLISTED = "SHORTLISTED"
    BUILDER_SELECTED = "BUILDER_SELECTED"
    CLOSED = "CLOSED"


class QuoteStatus(str, enum.Enum):
    SUBMITTED = "SUBMITTED"
    VIEWED = "VIEWED"
    SHORTLISTED = "SHORTLISTED"
    REJECTED = "REJECTED"
    ACCEPTED = "ACCEPTED"


class BuilderOpportunityStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    VIEWED = "VIEWED"
    QUOTE_SUBMITTED = "QUOTE_SUBMITTED"
    SHORTLISTED = "SHORTLISTED"
    SELECTED = "SELECTED"
    NOT_SELECTED = "NOT_SELECTED"


class PackageType(str, enum.Enum):
    BASIC = "BASIC"
    STANDARD = "STANDARD"
    PREMIUM = "PREMIUM"
    CUSTOM = "CUSTOM"

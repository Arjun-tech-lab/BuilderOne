"""Application configuration via environment variables."""
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Default to SQLite for local demo without Postgres; switch DATABASE_URL to PostgreSQL when ready.
    database_url: str = "sqlite:///./builderone.db"
    jwt_secret: str = "dev-secret-change-me-builderone-mvp"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7
    cors_origins: str = "http://localhost:3000"
    storage_provider: str = "local"
    storage_bucket: str = ""
    storage_region: str = ""
    storage_access_key: str = ""
    storage_secret_key: str = ""
    storage_local_path: str = "./uploads"
    seed_on_startup: bool = True
    app_name: str = "BuilderOne"
    api_prefix: str = "/api"

    @property
    def cors_origin_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")


@lru_cache
def get_settings() -> Settings:
    return Settings()

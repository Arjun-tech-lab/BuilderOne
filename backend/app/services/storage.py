"""
Storage abstraction for portfolio / upload images.

MVP uses local filesystem. Swap providers via STORAGE_PROVIDER env
without changing callers (S3 / Cloudinary ready).
"""
from __future__ import annotations

import abc
import shutil
import uuid
from pathlib import Path
from typing import BinaryIO

from app.core.config import get_settings


class StorageBackend(abc.ABC):
    @abc.abstractmethod
    def save(self, fileobj: BinaryIO, filename: str, content_type: str | None = None) -> str:
        """Persist file and return a publicly reachable URL / path."""


class LocalStorageBackend(StorageBackend):
    def __init__(self, root: str):
        self.root = Path(root)
        self.root.mkdir(parents=True, exist_ok=True)

    def save(self, fileobj: BinaryIO, filename: str, content_type: str | None = None) -> str:
        ext = Path(filename).suffix or ".jpg"
        key = f"{uuid.uuid4().hex}{ext}"
        dest = self.root / key
        with dest.open("wb") as out:
            shutil.copyfileobj(fileobj, out)
        return f"/uploads/{key}"


class S3StorageBackend(StorageBackend):
    """Placeholder — wire boto3 when STORAGE_PROVIDER=s3."""

    def __init__(self):
        settings = get_settings()
        self.bucket = settings.storage_bucket
        # TODO: initialize boto3 client with STORAGE_ACCESS_KEY / SECRET / REGION

    def save(self, fileobj: BinaryIO, filename: str, content_type: str | None = None) -> str:
        raise NotImplementedError(
            "S3 storage is not configured yet. Set STORAGE_PROVIDER=local for MVP."
        )


def get_storage() -> StorageBackend:
    settings = get_settings()
    if settings.storage_provider == "s3":
        return S3StorageBackend()
    return LocalStorageBackend(settings.storage_local_path)

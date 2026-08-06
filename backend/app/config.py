"""Application configuration settings."""

from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "DeepLink Pro API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/deeplink"
    REDIS_URL: str = "redis://localhost:6379/0"
    CLICKHOUSE_URL: str = "http://localhost:8123"

    # Pool sizes
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    REDIS_POOL_SIZE: int = 50

    # Shortlink configs
    LINK_ID_LENGTH: int = 7
    LINK_ID_ALPHABET: str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    REDIRECT_CACHE_TTL: int = 300  # 5 minutes

    # Security & CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    @property
    def cors_origins_list(self) -> List[str]:
        return self.CORS_ORIGINS

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


def get_settings() -> Settings:
    return Settings()

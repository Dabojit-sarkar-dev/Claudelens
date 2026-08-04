from functools import lru_cache
from typing import List, Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "ClauseLens API"
    api_v1_prefix: str = "/v1"
    secret_key: str = Field(default="dev-secret-change-in-production", validation_alias="SECRET_KEY")
    access_token_expire_minutes: int = 60 * 24
    algorithm: str = "HS256"

    database_url: str = Field(
        default="postgresql+psycopg2://clauselens:clauselens@localhost:5432/clauselens",
        validation_alias="DATABASE_URL",
    )
    use_mock_api: bool = Field(default=False, validation_alias="USE_MOCK_API")
    gemini_api_key: Optional[str] = Field(default=None, validation_alias="GEMINI_API_KEY")
    groq_api_key: Optional[str] = Field(default=None, validation_alias="GROQ_API_KEY")
    ollama_url: str = Field(default="http://localhost:11434", validation_alias="OLLAMA_URL")

    frontend_origins: str = Field(
        default="http://localhost:3000,http://localhost:5173",
        validation_alias="FRONTEND_ORIGINS",
    )

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.frontend_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

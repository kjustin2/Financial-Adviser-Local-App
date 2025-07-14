"""Application configuration settings."""

from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(
        env_file=".env", env_ignore_empty=True, case_sensitive=False
    )

    # Application
    app_name: str = "Financial Adviser API"
    app_version: str = "0.1.0"
    debug: bool = False

    # Database
    database_url: str = "sqlite:///./database/financial_adviser.db"
    echo_sql: bool = False

    # Security
    secret_key: str = "your-secret-key-change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    @property
    def is_production_ready(self) -> bool:
        """Check if configuration is production ready."""
        return self.secret_key != "your-secret-key-change-this-in-production"

    # API Keys (encrypted storage)
    alpha_vantage_api_key: Optional[str] = None
    polygon_api_key: Optional[str] = None
    iex_cloud_api_key: Optional[str] = None

    # CORS
    allowed_origins: list[str] = [
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative dev port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    # Rate limiting - Very relaxed for local development and testing
    rate_limit_requests: int = 10000  # 10k requests per window
    rate_limit_window: int = 60  # seconds

    # Data directory
    data_dir: Path = Path("./database")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Ensure data directory exists
        self.data_dir.mkdir(exist_ok=True, parents=True)


settings = Settings()

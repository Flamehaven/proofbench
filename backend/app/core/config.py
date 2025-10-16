# [*] ProofBench Backend - Configuration Management
# Pydantic settings for environment variables

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, Union


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    Environment variables can be set via:
    - .env file in backend/ directory
    - System environment variables
    - Docker environment configuration
    """

    # [=] Application Settings
    APP_NAME: str = "ProofBench API"
    APP_VERSION: str = "3.7.2"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = False

    # [=] Database Settings
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://proofbench:proofbench@localhost:5432/proofbench",
        description="Async PostgreSQL connection string"
    )

    # [=] Security Settings
    API_KEY: str = Field(
        default="dev-api-key-change-in-production",
        description="API key for authentication"
    )
    API_KEY_HEADER: str = "X-API-Key"
    CORS_ORIGINS: Union[list[str], str] = Field(
        default=["http://localhost:3000", "http://localhost:5173"],
        description="Allowed CORS origins for frontend (comma-separated string or list)"
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS_ORIGINS from comma-separated string or list"""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    # [=] LLM API Settings (for future real LLM integration)
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None

    # LLM Configuration
    LLM_TIMEOUT: int = Field(default=30, description="LLM API timeout in seconds")
    LLM_MAX_RETRIES: int = Field(default=3, description="Maximum retry attempts for LLM calls")

    # [=] Verification Settings
    SYMBOLIC_WEIGHT: float = Field(default=0.7, description="Weight for symbolic verification (0-1)")
    SEMANTIC_WEIGHT: float = Field(default=0.3, description="Weight for semantic evaluation (0-1)")
    PASS_THRESHOLD: float = Field(default=70.0, description="Minimum score to pass (0-100)")

    # [=] Performance Settings
    WORKER_TIMEOUT: int = Field(default=300, description="Background worker timeout in seconds")
    MAX_CONCURRENT_VERIFICATIONS: int = Field(default=5, description="Max parallel proof verifications")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Validate weights
        if not (0 <= self.SYMBOLIC_WEIGHT <= 1 and 0 <= self.SEMANTIC_WEIGHT <= 1):
            raise ValueError("Weights must be between 0 and 1")
        if abs(self.SYMBOLIC_WEIGHT + self.SEMANTIC_WEIGHT - 1.0) > 0.01:
            raise ValueError("Symbolic and semantic weights must sum to 1.0")


# [+] Global settings instance
settings = Settings()


# [T] Helper functions for configuration management

def get_database_url() -> str:
    """Get the database connection URL"""
    return settings.DATABASE_URL


def is_production() -> bool:
    """Check if running in production mode"""
    return not settings.DEBUG


def get_verification_config() -> dict:
    """Get verification engine configuration"""
    return {
        "symbolic_weight": settings.SYMBOLIC_WEIGHT,
        "semantic_weight": settings.SEMANTIC_WEIGHT,
        "pass_threshold": settings.PASS_THRESHOLD,
    }

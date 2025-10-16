# [B] ProofBench Backend - Configuration Tests
# Unit tests for configuration management and validation

import pytest
from pydantic import ValidationError

from app.core.config import Settings, get_database_url, is_production, get_verification_config


class TestSettings:
    """Test suite for Settings configuration"""

    def test_default_settings(self):
        """Test that default settings are loaded correctly"""
        # Act
        settings = Settings()

        # Assert
        assert settings.APP_NAME == "ProofBench API"
        assert settings.APP_VERSION == "3.7.2"
        assert settings.DEBUG is False
        assert settings.SYMBOLIC_WEIGHT == 0.7
        assert settings.SEMANTIC_WEIGHT == 0.3

    def test_custom_database_url(self):
        """Test custom database URL"""
        # Act
        settings = Settings(DATABASE_URL="postgresql://custom:5432/test")

        # Assert
        assert settings.DATABASE_URL == "postgresql://custom:5432/test"

    def test_api_key_configuration(self):
        """Test API key configuration"""
        # Act
        settings = Settings(API_KEY="my-secure-key")

        # Assert
        assert settings.API_KEY == "my-secure-key"
        assert settings.API_KEY_HEADER == "X-API-Key"

    def test_cors_origins_as_list(self):
        """Test CORS origins as list"""
        # Act
        settings = Settings(CORS_ORIGINS=["http://localhost:3000", "http://app.com"])

        # Assert
        assert isinstance(settings.CORS_ORIGINS, list)
        assert len(settings.CORS_ORIGINS) == 2

    def test_cors_origins_as_string(self):
        """Test CORS origins as comma-separated string"""
        # Act
        settings = Settings(CORS_ORIGINS="http://localhost:3000,http://app.com")

        # Assert
        assert isinstance(settings.CORS_ORIGINS, list)
        assert len(settings.CORS_ORIGINS) == 2
        assert "http://localhost:3000" in settings.CORS_ORIGINS

    def test_llm_configuration(self):
        """Test LLM API configuration"""
        # Act
        settings = Settings(
            OPENAI_API_KEY="sk-test123",
            ANTHROPIC_API_KEY="ant-test456",
            GOOGLE_API_KEY="goog-test789"
        )

        # Assert
        assert settings.OPENAI_API_KEY == "sk-test123"
        assert settings.ANTHROPIC_API_KEY == "ant-test456"
        assert settings.GOOGLE_API_KEY == "goog-test789"

    def test_verification_weights(self):
        """Test verification weight configuration"""
        # Act
        settings = Settings(SYMBOLIC_WEIGHT=0.8, SEMANTIC_WEIGHT=0.2)

        # Assert
        assert settings.SYMBOLIC_WEIGHT == 0.8
        assert settings.SEMANTIC_WEIGHT == 0.2

    def test_invalid_weights_out_of_range(self):
        """Test that weights outside 0-1 range are rejected"""
        # Act & Assert
        with pytest.raises(ValueError, match="Weights must be between 0 and 1"):
            Settings(SYMBOLIC_WEIGHT=1.5, SEMANTIC_WEIGHT=-0.5)

    def test_invalid_weights_not_sum_to_one(self):
        """Test that weights not summing to 1.0 are rejected"""
        # Act & Assert
        with pytest.raises(ValueError, match="must sum to 1.0"):
            Settings(SYMBOLIC_WEIGHT=0.6, SEMANTIC_WEIGHT=0.5)

    def test_pass_threshold_configuration(self):
        """Test pass threshold configuration"""
        # Act
        settings = Settings(PASS_THRESHOLD=75.0)

        # Assert
        assert settings.PASS_THRESHOLD == 75.0

    def test_performance_settings(self):
        """Test performance-related settings"""
        # Act
        settings = Settings(
            WORKER_TIMEOUT=600,
            MAX_CONCURRENT_VERIFICATIONS=10
        )

        # Assert
        assert settings.WORKER_TIMEOUT == 600
        assert settings.MAX_CONCURRENT_VERIFICATIONS == 10

    def test_debug_mode(self):
        """Test debug mode configuration"""
        # Act
        settings_debug = Settings(DEBUG=True)
        settings_prod = Settings(DEBUG=False)

        # Assert
        assert settings_debug.DEBUG is True
        assert settings_prod.DEBUG is False


class TestConfigHelpers:
    """Test suite for configuration helper functions"""

    def test_get_database_url(self):
        """Test database URL helper"""
        # Act
        url = get_database_url()

        # Assert
        assert isinstance(url, str)
        assert "postgresql" in url or "sqlite" in url

    def test_is_production(self):
        """Test production mode detection"""
        # Act
        result = is_production()

        # Assert
        assert isinstance(result, bool)

    def test_get_verification_config(self):
        """Test verification config helper"""
        # Act
        config = get_verification_config()

        # Assert
        assert "symbolic_weight" in config
        assert "semantic_weight" in config
        assert "pass_threshold" in config
        assert config["symbolic_weight"] + config["semantic_weight"] == pytest.approx(1.0)

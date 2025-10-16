# [*] ProofBench Backend - LLM Base Classes and Data Models
# Common interfaces and DTOs for all LLM providers

from pydantic import BaseModel, Field
from typing import Optional, Any
from abc import ABC, abstractmethod


class LLMUsage(BaseModel):
    """Token usage statistics from LLM API call"""
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0


class LLMResponse(BaseModel):
    """Standardized response from any LLM provider"""
    provider: str = Field(..., description="Provider name (openai, anthropic, google)")
    model: str = Field(..., description="Model identifier")
    score: int = Field(..., ge=0, le=100, description="Evaluation score (0-100)")
    reasoning: str = Field(..., description="Natural language reasoning")
    raw_response: Any = Field(..., description="Raw API response")
    usage: LLMUsage = Field(..., description="Token usage statistics")
    cost: float = Field(..., ge=0, description="API call cost in USD")
    duration_ms: int = Field(..., ge=0, description="Response time in milliseconds")

    model_config = {"from_attributes": True}


class EvaluationOptions(BaseModel):
    """Configuration options for LLM evaluation"""
    model: Optional[str] = Field(None, description="Override default model")
    temperature: float = Field(0.3, ge=0, le=2, description="Sampling temperature")
    max_tokens: int = Field(500, ge=1, le=4096, description="Maximum completion tokens")
    json_mode: bool = Field(True, description="Request JSON format response")


class ParsedResponse(BaseModel):
    """Parsed evaluation response with score and reasoning"""
    score: int = Field(50, ge=0, le=100, description="Evaluation score")
    reasoning: str = Field("No reasoning provided", description="Explanation")


class BaseLLMProvider(ABC):
    """
    Abstract base class for all LLM providers.

    All provider implementations must inherit from this class
    and implement the evaluate() method.
    """

    @abstractmethod
    async def evaluate(self, prompt: str, options: EvaluationOptions) -> LLMResponse:
        """
        Evaluate a proof step with the LLM.

        Args:
            prompt: Evaluation prompt with proof context
            options: Configuration for the evaluation

        Returns:
            LLMResponse: Standardized response with score and reasoning

        Raises:
            ConnectionError: If API call fails
        """
        pass

    @abstractmethod
    def _parse_response(self, response: str) -> ParsedResponse:
        """
        Parse raw LLM response into structured format.

        Args:
            response: Raw text response from LLM

        Returns:
            ParsedResponse: Parsed score and reasoning
        """
        pass

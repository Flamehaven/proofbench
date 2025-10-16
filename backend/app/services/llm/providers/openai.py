# [>] ProofBench Backend - OpenAI Provider
# Integration with OpenAI GPT models

import time
import json
import re
from typing import Optional

try:
    from openai import AsyncOpenAI
    from openai import RateLimitError as OpenAIRateLimitError
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    AsyncOpenAI = None
    OpenAIRateLimitError = Exception

from app.core.config import settings
from app.services.llm.base import (
    BaseLLMProvider,
    LLMResponse,
    EvaluationOptions,
    ParsedResponse,
    LLMUsage
)
from app.services.llm.cost_tracker import CostTracker


class OpenAIProvider(BaseLLMProvider):
    """
    OpenAI GPT provider for proof evaluation.

    Supports: GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo
    """

    def __init__(self):
        """
        Initialize OpenAI client.

        Raises:
            ValueError: If OPENAI_API_KEY not set or openai library not installed
        """
        if not OPENAI_AVAILABLE:
            raise ValueError("openai library not installed. Run: pip install openai>=1.10.0")

        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is not set in environment")

        self.client = AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY,
            timeout=settings.LLM_TIMEOUT,
            max_retries=settings.LLM_MAX_RETRIES
        )
        self.cost_tracker = CostTracker(provider="openai")
        self.default_model = "gpt-4o-2024-05-13"

    async def evaluate(self, prompt: str, options: EvaluationOptions) -> LLMResponse:
        """
        Evaluate proof with OpenAI GPT model.

        Args:
            prompt: Evaluation prompt with proof context
            options: Configuration options

        Returns:
            LLMResponse: Standardized response

        Raises:
            ConnectionError: If API call fails
        """
        start_time = time.time()
        model = options.model or self.default_model

        try:
            # System message for consistent evaluation
            system_message = (
                "You are a mathematical proof evaluator. Analyze the provided proof step "
                "and provide a score from 0-100 based on logical soundness and correctness. "
                "Respond in JSON format with 'score' (integer 0-100) and 'reasoning' (string) fields."
            )

            # Create chat completion
            completion = await self.client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": prompt}
                ],
                temperature=options.temperature,
                max_tokens=options.max_tokens,
                response_format={"type": "json_object"} if options.json_mode else None,
            )

            # Extract response data
            raw_response = completion.choices[0].message.content or ''
            usage_dict = completion.usage.model_dump() if hasattr(completion.usage, 'model_dump') else completion.usage.dict()
            usage = LLMUsage(**usage_dict)

            # Calculate cost
            cost = self.cost_tracker.calculate(model, usage)

            # Parse response
            parsed = self._parse_response(raw_response)

            duration_ms = int((time.time() - start_time) * 1000)

            return LLMResponse(
                provider="openai",
                model=model,
                score=parsed.score,
                reasoning=parsed.reasoning,
                raw_response=raw_response,
                usage=usage,
                cost=cost,
                duration_ms=duration_ms,
            )

        except OpenAIRateLimitError as e:
            error_msg = str(e) if hasattr(e, 'message') else str(e)
            raise ConnectionError(f"OpenAI rate limit exceeded: {error_msg}") from e
        except Exception as e:
            raise ConnectionError(f"OpenAI API request failed: {str(e)}") from e

    def _parse_response(self, response: str) -> ParsedResponse:
        """
        Parse OpenAI response into structured format.

        Handles both JSON and text responses with fallback parsing.

        Args:
            response: Raw response text

        Returns:
            ParsedResponse: Parsed score and reasoning
        """
        try:
            # Try JSON parsing first
            data = json.loads(response)
            score = data.get('score', 50)
            reasoning = data.get('reasoning', response[:200])

            # Validate score range
            if not isinstance(score, int) or not (0 <= score <= 100):
                score = 50

            return ParsedResponse(score=score, reasoning=reasoning)

        except (json.JSONDecodeError, AttributeError):
            # Fallback: Extract score from text
            score_match = re.search(r'score[:\s]+(\d+)', response, re.IGNORECASE)
            score = int(score_match[1]) if score_match and 0 <= int(score_match[1]) <= 100 else 50

            # Use first 200 characters as reasoning
            reasoning = response[:200] if response else "Unable to parse response"

            return ParsedResponse(score=score, reasoning=reasoning)

    def get_cost_stats(self) -> dict:
        """Get cost tracking statistics"""
        return self.cost_tracker.get_stats()

# [>] ProofBench Backend - Anthropic Provider
# Integration with Anthropic Claude models

import time
import json
import re
from typing import Optional

try:
    from anthropic import AsyncAnthropic
    from anthropic import RateLimitError as AnthropicRateLimitError
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False
    AsyncAnthropic = None
    AnthropicRateLimitError = Exception

from app.core.config import settings
from app.services.llm.base import (
    BaseLLMProvider,
    LLMResponse,
    EvaluationOptions,
    ParsedResponse,
    LLMUsage
)
from app.services.llm.cost_tracker import CostTracker


class AnthropicProvider(BaseLLMProvider):
    """
    Anthropic Claude provider for proof evaluation.

    Supports: Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku
    """

    def __init__(self):
        """
        Initialize Anthropic client.

        Raises:
            ValueError: If ANTHROPIC_API_KEY not set or anthropic library not installed
        """
        if not ANTHROPIC_AVAILABLE:
            raise ValueError("anthropic library not installed. Run: pip install anthropic>=0.8.1")

        if not settings.ANTHROPIC_API_KEY:
            raise ValueError("ANTHROPIC_API_KEY is not set in environment")

        self.client = AsyncAnthropic(
            api_key=settings.ANTHROPIC_API_KEY,
            timeout=settings.LLM_TIMEOUT,
            max_retries=settings.LLM_MAX_RETRIES
        )
        self.cost_tracker = CostTracker(provider="anthropic")
        self.default_model = "claude-3-5-sonnet-20240620"

    async def evaluate(self, prompt: str, options: EvaluationOptions) -> LLMResponse:
        """
        Evaluate proof with Anthropic Claude model.

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

            # Create message with Claude's Messages API
            message = await self.client.messages.create(
                model=model,
                max_tokens=options.max_tokens,
                temperature=options.temperature,
                system=system_message,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            # Extract response data
            raw_response = message.content[0].text if message.content else ''

            # Build usage statistics
            usage = LLMUsage(
                prompt_tokens=message.usage.input_tokens,
                completion_tokens=message.usage.output_tokens,
                total_tokens=message.usage.input_tokens + message.usage.output_tokens
            )

            # Calculate cost
            cost = self.cost_tracker.calculate(model, usage)

            # Parse response
            parsed = self._parse_response(raw_response)

            duration_ms = int((time.time() - start_time) * 1000)

            return LLMResponse(
                provider="anthropic",
                model=model,
                score=parsed.score,
                reasoning=parsed.reasoning,
                raw_response=raw_response,
                usage=usage,
                cost=cost,
                duration_ms=duration_ms,
            )

        except AnthropicRateLimitError as e:
            error_msg = str(e)
            raise ConnectionError(f"Anthropic rate limit exceeded: {error_msg}") from e
        except Exception as e:
            raise ConnectionError(f"Anthropic API request failed: {str(e)}") from e

    def _parse_response(self, response: str) -> ParsedResponse:
        """
        Parse Anthropic response into structured format.

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

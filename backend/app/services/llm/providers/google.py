# [>] ProofBench Backend - Google AI Provider
# Integration with Google Gemini models

import time
import json
import re
from typing import Optional

try:
    import google.generativeai as genai
    GOOGLE_AVAILABLE = True
except ImportError:
    GOOGLE_AVAILABLE = False
    genai = None

from app.core.config import settings
from app.services.llm.base import (
    BaseLLMProvider,
    LLMResponse,
    EvaluationOptions,
    ParsedResponse,
    LLMUsage
)
from app.services.llm.cost_tracker import CostTracker


class GoogleAIProvider(BaseLLMProvider):
    """
    Google AI (Gemini) provider for proof evaluation.

    Supports: Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini Pro
    """

    def __init__(self):
        """
        Initialize Google AI client.

        Raises:
            ValueError: If GOOGLE_API_KEY not set or google-generativeai library not installed
        """
        if not GOOGLE_AVAILABLE:
            raise ValueError("google-generativeai library not installed. Run: pip install google-generativeai>=0.3.2")

        if not settings.GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY is not set in environment")

        genai.configure(api_key=settings.GOOGLE_API_KEY)
        self.cost_tracker = CostTracker(provider="google")
        self.default_model = "gemini-1.5-pro"

    async def evaluate(self, prompt: str, options: EvaluationOptions) -> LLMResponse:
        """
        Evaluate proof with Google Gemini model.

        Args:
            prompt: Evaluation prompt with proof context
            options: Configuration options

        Returns:
            LLMResponse: Standardized response

        Raises:
            ConnectionError: If API call fails
        """
        start_time = time.time()
        model_name = options.model or self.default_model

        try:
            # Configure model
            generation_config = {
                "temperature": options.temperature,
                "max_output_tokens": options.max_tokens,
            }

            if options.json_mode:
                generation_config["response_mime_type"] = "application/json"

            model = genai.GenerativeModel(
                model_name=model_name,
                generation_config=generation_config
            )

            # System instruction (prepend to prompt for Gemini)
            system_instruction = (
                "You are a mathematical proof evaluator. Analyze the provided proof step "
                "and provide a score from 0-100 based on logical soundness and correctness. "
                "Respond in JSON format with 'score' (integer 0-100) and 'reasoning' (string) fields."
            )

            full_prompt = f"{system_instruction}\n\n{prompt}"

            # Generate content
            response = await model.generate_content_async(full_prompt)

            # Extract response data
            raw_response = response.text if response.text else ''

            # Build usage statistics (Gemini provides token counts)
            usage = LLMUsage(
                prompt_tokens=response.usage_metadata.prompt_token_count if hasattr(response, 'usage_metadata') else 0,
                completion_tokens=response.usage_metadata.candidates_token_count if hasattr(response, 'usage_metadata') else 0,
                total_tokens=response.usage_metadata.total_token_count if hasattr(response, 'usage_metadata') else 0
            )

            # Calculate cost
            cost = self.cost_tracker.calculate(model_name, usage)

            # Parse response
            parsed = self._parse_response(raw_response)

            duration_ms = int((time.time() - start_time) * 1000)

            return LLMResponse(
                provider="google",
                model=model_name,
                score=parsed.score,
                reasoning=parsed.reasoning,
                raw_response=raw_response,
                usage=usage,
                cost=cost,
                duration_ms=duration_ms,
            )

        except Exception as e:
            # Google AI exceptions are varied, catch all
            if "quota" in str(e).lower() or "rate" in str(e).lower():
                raise ConnectionError(f"Google AI rate limit exceeded: {str(e)}") from e
            raise ConnectionError(f"Google AI API request failed: {str(e)}") from e

    def _parse_response(self, response: str) -> ParsedResponse:
        """
        Parse Google AI response into structured format.

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

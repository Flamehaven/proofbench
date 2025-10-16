# [=] ProofBench Backend - Unified LLM Adapter
# Manages multiple LLM providers with parallel evaluation and fallback

import asyncio
from typing import List, Dict, Optional
import statistics

from app.core.config import settings
from app.services.llm.base import LLMResponse, EvaluationOptions

# Import providers with graceful fallback
try:
    from app.services.llm.providers.openai import OpenAIProvider
except (ImportError, ValueError):
    OpenAIProvider = None

try:
    from app.services.llm.providers.anthropic import AnthropicProvider
except (ImportError, ValueError):
    AnthropicProvider = None

try:
    from app.services.llm.providers.google import GoogleAIProvider
except (ImportError, ValueError):
    GoogleAIProvider = None


class ConsensusResult:
    """Result of multi-model consensus evaluation"""

    def __init__(self, responses: List[LLMResponse]):
        self.responses = responses
        self.scores = [r.score for r in responses]

        # Calculate statistics
        self.average_score = statistics.mean(self.scores)
        self.median_score = statistics.median(self.scores)
        self.variance = statistics.variance(self.scores) if len(self.scores) > 1 else 0
        self.std_dev = statistics.stdev(self.scores) if len(self.scores) > 1 else 0

        # Calculate coherence (inverse of variance, normalized to 0-100)
        # Low variance = high coherence
        self.coherence_score = max(0, 100 - (self.variance / 10))

        # Calculate total cost
        self.total_cost = sum(r.cost for r in responses)

    def to_dict(self) -> dict:
        """Export consensus result as dictionary"""
        return {
            "average_score": round(self.average_score, 2),
            "median_score": round(self.median_score, 2),
            "variance": round(self.variance, 2),
            "std_dev": round(self.std_dev, 2),
            "coherence_score": round(self.coherence_score, 2),
            "total_cost": round(self.total_cost, 4),
            "provider_count": len(self.responses),
            "providers": [r.provider for r in self.responses]
        }


class LLMAdapter:
    """
    Unified adapter for multiple LLM providers.

    Features:
    - Parallel evaluation across all providers
    - Fallback mechanism (try providers in order)
    - Consensus calculation from multiple responses
    - Cost tracking across providers
    """

    def __init__(self):
        """
        Initialize LLM adapter with available providers.

        Providers are initialized only if:
        1. Library is installed
        2. API key is configured
        """
        self.services: Dict[str, any] = {}

        # Initialize OpenAI if available
        if OpenAIProvider and settings.OPENAI_API_KEY:
            try:
                self.services["openai"] = OpenAIProvider()
                print("[+] OpenAI provider initialized")
            except Exception as e:
                print(f"[W] Failed to initialize OpenAI: {e}")

        # Initialize Anthropic if available
        if AnthropicProvider and settings.ANTHROPIC_API_KEY:
            try:
                self.services["anthropic"] = AnthropicProvider()
                print("[+] Anthropic provider initialized")
            except Exception as e:
                print(f"[W] Failed to initialize Anthropic: {e}")

        # Initialize Google AI if available
        if GoogleAIProvider and settings.GOOGLE_API_KEY:
            try:
                self.services["google"] = GoogleAIProvider()
                print("[+] Google AI provider initialized")
            except Exception as e:
                print(f"[W] Failed to initialize Google AI: {e}")

        if not self.services:
            print("[W] No LLM providers available. Set API keys in .env file.")

        # Fallback order (prefer OpenAI, then Anthropic, then Google)
        self.fallback_order = ["openai", "anthropic", "google"]

    async def evaluate_parallel(
        self,
        prompt: str,
        options: Optional[EvaluationOptions] = None
    ) -> List[LLMResponse]:
        """
        Evaluate proof with all available providers in parallel.

        Args:
            prompt: Evaluation prompt
            options: Configuration options

        Returns:
            List[LLMResponse]: All successful responses

        Raises:
            ConnectionError: If all providers fail
        """
        if not self.services:
            raise ConnectionError("No LLM providers available")

        options = options or EvaluationOptions()

        # Create tasks for all providers
        tasks = []
        for provider_name, service in self.services.items():
            task = asyncio.create_task(
                self._safe_evaluate(service, prompt, options, provider_name)
            )
            tasks.append(task)

        # Wait for all tasks to complete
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Filter successful results
        successful_results = [
            res for res in results
            if isinstance(res, LLMResponse)
        ]

        if not successful_results:
            errors = [res for res in results if isinstance(res, Exception)]
            raise ConnectionError(f"All LLM evaluations failed. Errors: {errors}")

        return successful_results

    async def evaluate_with_fallback(
        self,
        prompt: str,
        options: Optional[EvaluationOptions] = None
    ) -> LLMResponse:
        """
        Evaluate proof with fallback mechanism.

        Tries providers in order (openai → anthropic → google) until success.

        Args:
            prompt: Evaluation prompt
            options: Configuration options

        Returns:
            LLMResponse: First successful response

        Raises:
            ConnectionError: If all providers fail
        """
        if not self.services:
            raise ConnectionError("No LLM providers available")

        options = options or EvaluationOptions()

        for provider_name in self.fallback_order:
            if provider_name not in self.services:
                continue

            service = self.services[provider_name]
            try:
                print(f"[>] Attempting evaluation with {provider_name}...")
                response = await service.evaluate(prompt, options)
                print(f"[+] Evaluation with {provider_name} succeeded")
                return response

            except ConnectionError as e:
                print(f"[-] Evaluation with {provider_name} failed: {e}")
                # Add small delay before trying next provider
                await asyncio.sleep(1)

        raise ConnectionError("All LLM providers failed to respond.")

    async def _safe_evaluate(
        self,
        service,
        prompt: str,
        options: EvaluationOptions,
        provider_name: str
    ) -> LLMResponse:
        """
        Safely evaluate with a provider, catching exceptions.

        Args:
            service: Provider instance
            prompt: Evaluation prompt
            options: Configuration options
            provider_name: Provider name for logging

        Returns:
            LLMResponse or Exception
        """
        try:
            return await service.evaluate(prompt, options)
        except Exception as e:
            print(f"[-] {provider_name} evaluation failed: {e}")
            raise

    def calculate_consensus(self, responses: List[LLMResponse]) -> ConsensusResult:
        """
        Calculate consensus from multiple LLM responses.

        Args:
            responses: List of LLM responses

        Returns:
            ConsensusResult: Consensus statistics

        Raises:
            ValueError: If responses list is empty
        """
        if not responses:
            raise ValueError("Cannot calculate consensus from empty response list")

        return ConsensusResult(responses)

    def get_available_providers(self) -> List[str]:
        """Get list of available provider names"""
        return list(self.services.keys())

    def has_providers(self) -> bool:
        """Check if any providers are available"""
        return len(self.services) > 0


# [T] Global singleton instance (optional)
# llm_adapter = LLMAdapter()

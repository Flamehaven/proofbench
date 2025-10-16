# [$] ProofBench Backend - LLM Cost Tracking
# Track and calculate API costs for different LLM providers

from app.services.llm.base import LLMUsage
from typing import Dict


class CostTracker:
    """
    Track and calculate costs for LLM API usage.

    Pricing is per 1,000 tokens (as of 2025-01-01).
    Update pricing regularly as providers change rates.
    """

    # Pricing in USD per 1,000 tokens
    PRICING: Dict[str, Dict[str, Dict[str, float]]] = {
        "openai": {
            "gpt-4o": {"input": 0.0025, "output": 0.01},
            "gpt-4o-2024-05-13": {"input": 0.005, "output": 0.015},
            "gpt-4-turbo": {"input": 0.01, "output": 0.03},
            "gpt-4": {"input": 0.03, "output": 0.06},
            "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
        },
        "anthropic": {
            "claude-3-5-sonnet-20240620": {"input": 0.003, "output": 0.015},
            "claude-3-opus-20240229": {"input": 0.015, "output": 0.075},
            "claude-3-sonnet-20240229": {"input": 0.003, "output": 0.015},
            "claude-3-haiku-20240307": {"input": 0.00025, "output": 0.00125},
        },
        "google": {
            "gemini-1.5-pro": {"input": 0.00125, "output": 0.005},
            "gemini-1.5-flash": {"input": 0.000075, "output": 0.0003},
            "gemini-pro": {"input": 0.0005, "output": 0.0015},
        }
    }

    def __init__(self, provider: str):
        """
        Initialize cost tracker for a specific provider.

        Args:
            provider: Provider name (openai, anthropic, google)
        """
        self.provider = provider.lower()
        self.total_cost = 0.0
        self.call_count = 0

    def calculate(self, model: str, usage: LLMUsage) -> float:
        """
        Calculate cost for a single API call.

        Args:
            model: Model identifier
            usage: Token usage statistics

        Returns:
            float: Cost in USD

        Note:
            Returns 0.0 if model pricing not found (unknown model)
        """
        rates = self.PRICING.get(self.provider, {}).get(model)
        if not rates:
            print(f"[W] No pricing data for {self.provider}/{model}, cost = $0.00")
            return 0.0

        # Calculate cost based on token usage
        input_cost = (usage.prompt_tokens / 1000) * rates["input"]
        output_cost = (usage.completion_tokens / 1000) * rates["output"]
        cost = input_cost + output_cost

        # Track cumulative cost
        self.total_cost += cost
        self.call_count += 1

        return cost

    def get_total_cost(self) -> float:
        """Get cumulative cost for all calls"""
        return self.total_cost

    def get_average_cost(self) -> float:
        """Get average cost per call"""
        if self.call_count == 0:
            return 0.0
        return self.total_cost / self.call_count

    def get_stats(self) -> dict:
        """Get detailed cost statistics"""
        return {
            "provider": self.provider,
            "total_cost": round(self.total_cost, 4),
            "call_count": self.call_count,
            "average_cost": round(self.get_average_cost(), 4)
        }

    def reset(self):
        """Reset cost tracking"""
        self.total_cost = 0.0
        self.call_count = 0


# [T] Future enhancement: Add cost budgets and alerts
# class CostBudget:
#     def __init__(self, daily_limit: float = 10.0):
#         self.daily_limit = daily_limit
#         self.current_spending = 0.0
#
#     def check_budget(self, cost: float) -> bool:
#         if self.current_spending + cost > self.daily_limit:
#             raise BudgetExceededError(f"Daily budget ${self.daily_limit} exceeded")
#         return True

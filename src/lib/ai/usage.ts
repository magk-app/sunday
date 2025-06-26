import type { OpenAIUsage } from '../openai-service';

// Model-specific cost (per 1K tokens) based on OpenAI pricing 2025-06-25
// https://openai.com/pricing  
// NOTE: values are subject to change – keep in sync with docs
export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4o-mini': { input: 0.0005, output: 0.0015 }, // 4o-mini (previously 4.1 mini)
  'gpt-4o-nano': { input: 0.00025, output: 0.00075 }, // 4o-nano (hypothetical pricing)
  'gpt-4o': { input: 0.005, output: 0.015 }, // full 4o (previously 4.1)
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 }, // fallback
};

export function calculateCost(usage: any, model: string): number {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING['gpt-3.5-turbo'];
  const inputCost = (usage.prompt_tokens / 1000) * pricing.input;
  const outputCost = (usage.completion_tokens / 1000) * pricing.output;
  return inputCost + outputCost;
} 
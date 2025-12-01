export interface PromptQuality {
  clarity: number; // Max 20
  completeness: number; // Max 20
  specificity: number; // Max 20
  structure: number; // Max 20
  safety: number; // Max 20
}

export interface OutputQuality {
  relevance: number; // Max 40
  correctness: number; // Max 40
  format_compliance: number; // Max 20
}

export interface Efficiency {
  token_optimality: number; // 0.0 - 1.0
  latency_normalized: number; // 0.0 - 1.0
  cost_token_wasted: number; // Integer
}

export interface EvaluationMetrics {
  prompt_quality: PromptQuality;
  output_quality: OutputQuality;
  efficiency: Efficiency;
}

export interface EvaluationPair {
  human: EvaluationMetrics;
  llm: EvaluationMetrics;
}

export interface DataRecord {
  id: string;
  prompt: string;
  response: string;
  evaluation: EvaluationPair;
  timestamp?: number;
}

// Helpers to calculate totals
export const calculatePromptTotal = (metrics: PromptQuality): number => {
  return metrics.clarity + metrics.completeness + metrics.specificity + metrics.structure + metrics.safety;
};

export const calculateOutputTotal = (metrics: OutputQuality): number => {
  return metrics.relevance + metrics.correctness + metrics.format_compliance;
};

export const calculateTotalScore = (metrics: EvaluationMetrics): number => {
  return calculatePromptTotal(metrics.prompt_quality) + calculateOutputTotal(metrics.output_quality);
};

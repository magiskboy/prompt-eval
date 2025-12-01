import { useState, useEffect, useCallback } from 'react';
import { DataRecord, EvaluationPair } from '../types';

export interface FetchEvalsParams {
  user_query?: string;
  llm_response?: string;
  sort_field?: string;
  sort_order?: 'asc' | 'desc';
  skip?: number;
  limit?: number;
}

interface UseEvalsResult {
  data: DataRecord[];
  loading: boolean;
  error: string | null;
  refetch: (params?: FetchEvalsParams) => void;
}

const sanitizeRecord = (item: any, index: number): DataRecord => {

  const metrics: EvaluationPair = {
    llm: {
      efficiency: {
        token_optimality: 0,
        latency_normalized: 0,
        cost_token_wasted: 0,
      },
      prompt_quality: {
        clarity: item.llm_clarity,
        completeness: item.llm_completeness,
        specificity: item.llm_specificity,
        structure: item.llm_structure,
        safety: item.llm_safety,
      },
      output_quality: {
        relevance: item.llm_relevance,
        correctness: item.llm_correctness,
        format_compliance: item.llm_format_compliance,
      },
    },
    human: {
      efficiency: {
        token_optimality: 0,
        latency_normalized: 0,
        cost_token_wasted: 0,
      },
      prompt_quality: {
        clarity: item.human_clarity,
        completeness: item.human_completeness,
        specificity: item.human_specificity,
        structure: item.human_structure,
        safety: item.human_safety,
      },
      output_quality: {
        relevance: item.human_relevance,
        correctness: item.human_correctness,
        format_compliance: item.human_format_compliance,
      },
    }
  }
  return {
    id: `${item.session_id}` || `record-${index}-${Date.now()}`,
    prompt: item.user_query || "",
    response: item.llm_response || "",
    timestamp: item.created_at ? new Date(item.created_at).getTime() : new Date().getTime(),
    evaluation: metrics,
  };
};

export const useEvals = (initialParams?: FetchEvalsParams): UseEvalsResult => {
  const [data, setData] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (params: FetchEvalsParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Build Query String
      const queryParams = new URLSearchParams();
      if (params.user_query) queryParams.append('user_query', params.user_query);
      if (params.llm_response) queryParams.append('llm_response', params.llm_response);
      if (params.sort_field) queryParams.append('sort_field', params.sort_field);
      if (params.sort_order) queryParams.append('sort_order', params.sort_order);
      
      // Default limit to 100 to get a good initial set for the dashboard
      queryParams.append('skip', (params.skip || 0).toString());
      queryParams.append('limit', (params.limit || 100).toString());

      // Assumes API is available at /evals (via proxy) or http://localhost:8000/evals
      // Adjust base URL as needed for your environment
      // const baseUrl = 'http://localhost:8000'; 
      const baseUrl = process.env.BACKEND_BASE_URL;
      const response = await fetch(`${baseUrl}/evals?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const rawData = await response.json();
      
      // Handle both array response or paginated response format { items: [] }
      const items = Array.isArray(rawData) ? rawData : (rawData.items || []);
      
      const processedData = items.map((item: any, idx: number) => sanitizeRecord(item, idx)).sort((a, b) => b.timestamp - a.timestamp);
      setData(processedData);
    } catch (err) {
      console.error("Failed to fetch evals:", err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(initialParams);
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

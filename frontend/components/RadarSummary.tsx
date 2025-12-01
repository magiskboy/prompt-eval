import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';
import { EvaluationPair } from '../types';

interface RadarSummaryProps {
  evaluation: EvaluationPair;
}

const RadarSummary: React.FC<RadarSummaryProps> = ({ evaluation }) => {
  const data = [
    {
      subject: 'Prompt Clarity',
      A: evaluation.human.prompt_quality.clarity,
      B: evaluation.llm.prompt_quality.clarity,
      fullMark: 5,
    },
    {
      subject: 'P. Structure',
      A: evaluation.human.prompt_quality.structure,
      B: evaluation.llm.prompt_quality.structure,
      fullMark: 5,
    },
    {
      subject: 'Output Relevance',
      A: evaluation.human.output_quality.relevance,
      B: evaluation.llm.output_quality.relevance,
      fullMark: 5,
    },
    {
      subject: 'Output Correctness',
      A: evaluation.human.output_quality.correctness,
      B: evaluation.llm.output_quality.correctness,
      fullMark: 5,
    },
    {
      subject: 'Safety',
      A: evaluation.human.prompt_quality.safety,
      B: evaluation.llm.prompt_quality.safety,
      fullMark: 5,
    },
    {
      subject: 'Format',
      A: evaluation.human.output_quality.format_compliance,
      B: evaluation.llm.output_quality.format_compliance,
      fullMark: 5,
    },
  ];

  return (
    <div className="w-full h-80 bg-slate-800 rounded-xl border border-slate-700 p-4">
      <h3 className="text-lg font-semibold text-slate-100 mb-2">Quality Fingerprint</h3>
      <div className="w-full h-64 text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#475569" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
            <Radar
              name="Human"
              dataKey="A"
              stroke="#10b981"
              strokeWidth={2}
              fill="#10b981"
              fillOpacity={0.3}
            />
            <Radar
              name="LLM"
              dataKey="B"
              stroke="#6366f1"
              strokeWidth={2}
              fill="#6366f1"
              fillOpacity={0.3}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                itemStyle={{ color: '#e2e8f0' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RadarSummary;

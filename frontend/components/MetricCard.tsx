import React from 'react';
import { Info } from 'lucide-react';

interface MetricCardProps {
  label: string;
  humanValue: number;
  llmValue: number;
  maxValue: number;
  description?: string;
  type?: 'score' | 'ratio' | 'inverse'; // score: higher better, ratio: 0-1, inverse: lower better (like cost)
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  label, 
  humanValue, 
  llmValue, 
  maxValue, 
  description,
}) => {
  const getPercentage = (val: number) => {
    return Math.min(100, (val / maxValue) * 100)
  };

  return (
    <div className="mb-4 last:mb-0 group">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-300">{label}</span>
          {description && (
            <div className="group/tooltip relative">
              <Info size={14} className="text-slate-500 cursor-help" />
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-48 p-2 bg-slate-900 border border-slate-700 rounded shadow-xl text-xs text-slate-300 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none z-50 transition-opacity">
                {description}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-4 text-xs font-mono">
          <span className="text-emerald-400">Human: {humanValue.toFixed(2)}</span>
          <span className="text-indigo-400">LLM: {llmValue.toFixed(2)}</span>
        </div>
      </div>

      <div className="relative h-2 w-full bg-slate-700/50 rounded-full overflow-hidden flex flex-col gap-[1px]">
        {/* Human Bar */}
        <div 
          className="h-full absolute top-0 left-0 bg-emerald-500/80 transition-all duration-500 ease-out"
          style={{ width: `${getPercentage(humanValue)}%`, height: '50%', top: 0 }}
        />
        {/* LLM Bar */}
         <div 
          className="h-full absolute bottom-0 left-0 bg-indigo-500/80 transition-all duration-500 ease-out"
          style={{ width: `${getPercentage(llmValue)}%`, height: '50%', top: '50%' }}
        />
      </div>
    </div>
  );
};

export default MetricCard;

import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowRight } from 'lucide-react';
import { DataRecord, calculateTotalScore } from '../types';

interface DashboardProps {
  data: DataRecord[];
  onSelect: (record: DataRecord) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onSelect }) => {
  const [filterType, setFilterType] = useState<'all' | 'high_discrepancy' | 'low_score'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    return data.filter(record => {
      const matchesSearch = record.prompt.toLowerCase().includes(searchTerm.toLowerCase());
      
      const humanScore = calculateTotalScore(record.evaluation.human);
      const llmScore = calculateTotalScore(record.evaluation.llm);

      if (!matchesSearch) return false;

      if (filterType === 'high_discrepancy') {
        return Math.abs(humanScore - llmScore) > 20; // Show if difference > 20 points
      }
      if (filterType === 'low_score') {
        return humanScore < 100 || llmScore < 100; // Arbitrary low score threshold
      }

      return true;
    });
  }, [data, filterType, searchTerm]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Dashboard</h1>
          <p className="text-slate-400 mt-1">Reviewing {data.length} evaluation pairs</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search prompts..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <Filter size={18} className="text-slate-500 mr-2" />
          {['all', 'high_discrepancy', 'low_score'].map((ft) => (
            <button
              key={ft}
              onClick={() => setFilterType(ft as any)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                filterType === ft 
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50' 
                  : 'bg-slate-700/50 text-slate-400 border border-transparent hover:bg-slate-700'
              }`}
            >
              {ft.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredData.length === 0 ? (
          <div className="text-center py-20 text-slate-500 bg-slate-800/50 rounded-xl border border-slate-800 border-dashed">
            No records found matching your criteria.
          </div>
        ) : (
          filteredData.map((record) => {
             const humanScore = calculateTotalScore(record.evaluation.human);
             const llmScore = calculateTotalScore(record.evaluation.llm);
             
             return (
              <div 
                key={record.id} 
                onClick={() => onSelect(record)}
                className="group bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl p-5 cursor-pointer transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-900/10 flex flex-col md:flex-row gap-6 items-center"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">#{record.id.substring(0,6)}</span>
                    <span className="text-xs text-slate-500">{record.timestamp ? new Date(record.timestamp).toLocaleString('vi-VN') : 'No date'}</span>
                  </div>
                  <h3 className="text-slate-200 font-medium truncate mb-1 pr-4">{record.prompt}</h3>
                  <p className="text-slate-500 text-sm truncate">{record.response}</p>
                </div>

                <div className="flex items-center gap-8 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-700 pt-4 md:pt-0">
                  <div className="flex flex-col items-center min-w-[80px]">
                    <span className="text-xs text-slate-500 uppercase tracking-wider mb-1">Human</span>
                    <span className={`text-xl font-bold ${humanScore > 150 ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {humanScore.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-center min-w-[80px]">
                    <span className="text-xs text-slate-500 uppercase tracking-wider mb-1">LLM</span>
                    <span className={`text-xl font-bold ${llmScore > 150 ? 'text-indigo-400' : 'text-slate-300'}`}>
                      {llmScore.toFixed(2)}
                    </span>
                  </div>

                  <div className="w-px h-10 bg-slate-700 hidden md:block"></div>

                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-indigo-400 transition-colors">
                    <span className="text-sm font-medium hidden md:inline">Details</span>
                    <ArrowRight size={18} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Dashboard;

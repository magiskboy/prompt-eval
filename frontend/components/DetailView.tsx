import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, ChevronDown, ChevronUp, FileText, Code } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { DataRecord, calculateTotalScore } from '../types';
import MetricCard from './MetricCard';
import RadarSummary from './RadarSummary';

interface DetailViewProps {
  record: DataRecord;
  onBack: () => void;
}

type ViewMode = 'raw' | 'markdown';

const DetailView: React.FC<DetailViewProps> = ({ record, onBack }) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);
  
  const [promptView, setPromptView] = useState<ViewMode>('raw');
  const [responseView, setResponseView] = useState<ViewMode>('markdown');

  const [sections, setSections] = useState({
    promptQuality: true,
    outputQuality: true,
    efficiency: true
  });

  const copyToClipboard = (text: string, isPrompt: boolean) => {
    navigator.clipboard.writeText(text);
    if (isPrompt) {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } else {
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  };

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const humanTotal = calculateTotalScore(record.evaluation.human);
  const llmTotal = calculateTotalScore(record.evaluation.llm);

  const renderContent = (content: string, mode: ViewMode, isPrompt: boolean) => {
    if (mode === 'raw') {
      return (
        <div className="bg-slate-900 rounded p-3 h-full overflow-y-auto text-sm text-slate-300 font-mono leading-relaxed whitespace-pre-wrap border border-slate-700/50 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
          {content}
        </div>
      );
    }
    return (
      <div className="bg-slate-900 rounded p-3 h-full overflow-y-auto text-sm text-slate-300 border border-slate-700/50 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
        <div className="markdown-preview">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                return match ? (
                  <SyntaxHighlighter
                    {...props}
                    children={String(children).replace(/\n$/, '')}
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      padding: 0,
                      background: 'transparent',
                      fontSize: 'inherit',
                    }}
                  />
                ) : (
                  <code {...props} className={className}>
                    {children}
                  </code>
                );
              },
              table({ node, ...props }: any) {
                return (
                  <div className="overflow-x-auto my-4 rounded-lg border border-slate-700 bg-slate-800/30">
                    <table className="w-full text-left border-collapse" {...props} />
                  </div>
                );
              },
              thead({ node, ...props }: any) {
                return <thead className="bg-slate-800 text-slate-200 border-b border-slate-700" {...props} />;
              },
              tbody({ node, ...props }: any) {
                return <tbody className="divide-y divide-slate-700/50" {...props} />;
              },
              tr({ node, ...props }: any) {
                 return <tr className="hover:bg-slate-700/30 transition-colors" {...props} />;
              },
              th({ node, ...props }: any) {
                return <th className="p-3 font-semibold whitespace-nowrap text-xs uppercase tracking-wider text-slate-400 border-r border-slate-700 last:border-r-0" {...props} />;
              },
              td({ node, ...props }: any) {
                return <td className="p-3 text-sm min-w-[150px] border-r border-slate-700/50 last:border-r-0" {...props} />;
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    );
  };

  const ViewToggle = ({ mode, setMode }: { mode: ViewMode, setMode: (m: ViewMode) => void }) => (
    <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
      <button
        onClick={() => setMode('markdown')}
        className={`p-1.5 rounded-md transition-all ${mode === 'markdown' ? 'bg-slate-700 text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
        title="Markdown View"
      >
        <FileText size={14} />
      </button>
      <button
        onClick={() => setMode('raw')}
        className={`p-1.5 rounded-md transition-all ${mode === 'raw' ? 'bg-slate-700 text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
        title="Raw View"
      >
        <Code size={14} />
      </button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors self-start sm:self-auto"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <div className="flex gap-4 sm:gap-6 text-sm self-end sm:self-auto bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 sm:border-none sm:bg-transparent sm:p-0 w-full sm:w-auto justify-between sm:justify-end">
           <div className="flex flex-col items-end">
             <span className="text-slate-500 uppercase tracking-wider text-xs">Human Total</span>
             <span className="text-emerald-400 font-bold text-xl">{humanTotal}<span className="text-slate-600 text-sm">/40</span></span>
           </div>
           <div className="flex flex-col items-end">
             <span className="text-slate-500 uppercase tracking-wider text-xs">LLM Total</span>
             <span className="text-indigo-400 font-bold text-xl">{llmTotal}<span className="text-slate-600 text-sm">/40</span></span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Text Content (5 cols) 
            - Mobile: Normal flow, fixed height cards (h-96)
            - Desktop (lg): Sticky column, full viewport height minus offset
        */}
        <div className="lg:col-span-5 space-y-6 flex flex-col lg:h-[calc(100vh-8rem)] lg:sticky lg:top-20">
          {/* Prompt Card */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 shadow-sm flex flex-col h-96 lg:h-auto lg:flex-1 min-h-0">
            <div className="flex justify-between items-center mb-3 shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-slate-200">User Prompt</h3>
                <ViewToggle mode={promptView} setMode={setPromptView} />
              </div>
              <button 
                onClick={() => copyToClipboard(record.prompt, true)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700 transition-colors"
                title="Copy Prompt"
              >
                {copiedPrompt ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
              </button>
            </div>
            <div className="flex-1 min-h-0">
               {renderContent(record.prompt, promptView, true)}
            </div>
          </div>

          {/* Response Card */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 shadow-sm flex flex-col h-96 lg:h-auto lg:flex-1 min-h-0">
            <div className="flex justify-between items-center mb-3 shrink-0">
               <div className="flex items-center gap-3">
                <h3 className="font-semibold text-slate-200">LLM Response</h3>
                <ViewToggle mode={responseView} setMode={setResponseView} />
              </div>
              <button 
                 onClick={() => copyToClipboard(record.response, false)}
                 className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700 transition-colors"
                 title="Copy Response"
              >
                {copiedResponse ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
              </button>
            </div>
             <div className="flex-1 min-h-0">
               {renderContent(record.response, responseView, false)}
            </div>
          </div>
        </div>

        {/* Right Column: Metrics (7 cols) */}
        <div className="lg:col-span-7 space-y-6 pb-12">
          
          {/* Summary Chart */}
          <RadarSummary evaluation={record.evaluation} />

          {/* Prompt Quality */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <button 
              onClick={() => toggleSection('promptQuality')}
              className="w-full flex items-center justify-between p-4 bg-slate-800 hover:bg-slate-750 transition-colors border-b border-slate-700/50"
            >
              <h3 className="font-bold text-slate-100">Prompt Quality Metrics</h3>
              {sections.promptQuality ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
            </button>
            
            {sections.promptQuality && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                <MetricCard 
                  label="Clarity" 
                  maxValue={5} 
                  humanValue={record.evaluation.human.prompt_quality.clarity} 
                  llmValue={record.evaluation.llm.prompt_quality.clarity}
                  description="How clear and understandable the prompt is."
                />
                <MetricCard 
                  label="Completeness" 
                  maxValue={5} 
                  humanValue={record.evaluation.human.prompt_quality.completeness} 
                  llmValue={record.evaluation.llm.prompt_quality.completeness}
                  description="Does the prompt contain all necessary context?"
                />
                <MetricCard 
                  label="Specificity" 
                  maxValue={5} 
                  humanValue={record.evaluation.human.prompt_quality.specificity} 
                  llmValue={record.evaluation.llm.prompt_quality.specificity}
                />
                <MetricCard 
                  label="Structure" 
                  maxValue={5} 
                  humanValue={record.evaluation.human.prompt_quality.structure} 
                  llmValue={record.evaluation.llm.prompt_quality.structure}
                />
                <MetricCard 
                  label="Safety" 
                  maxValue={5} 
                  humanValue={record.evaluation.human.prompt_quality.safety} 
                  llmValue={record.evaluation.llm.prompt_quality.safety}
                  description="Adherence to safety guidelines."
                />
              </div>
            )}
          </div>

          {/* Output Quality */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <button 
              onClick={() => toggleSection('outputQuality')}
              className="w-full flex items-center justify-between p-4 bg-slate-800 hover:bg-slate-750 transition-colors border-b border-slate-700/50"
            >
              <h3 className="font-bold text-slate-100">Output Quality Metrics</h3>
              {sections.outputQuality ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
            </button>
            
            {sections.outputQuality && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-6">
                <MetricCard 
                  label="Relevance" 
                  maxValue={5} 
                  humanValue={record.evaluation.human.output_quality.relevance} 
                  llmValue={record.evaluation.llm.output_quality.relevance}
                  description="How relevant the response is to the prompt (Max 5)."
                />
                <MetricCard 
                  label="Correctness" 
                  maxValue={5} 
                  humanValue={record.evaluation.human.output_quality.correctness} 
                  llmValue={record.evaluation.llm.output_quality.correctness}
                  description="Factual accuracy of the response (Max 5)."
                />
                <MetricCard 
                  label="Format Compliance" 
                  maxValue={5} 
                  humanValue={record.evaluation.human.output_quality.format_compliance} 
                  llmValue={record.evaluation.llm.output_quality.format_compliance}
                />
              </div>
            )}
          </div>

          {/* Efficiency */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <button 
              onClick={() => toggleSection('efficiency')}
              className="w-full flex items-center justify-between p-4 bg-slate-800 hover:bg-slate-750 transition-colors border-b border-slate-700/50"
            >
              <h3 className="font-bold text-slate-100">Efficiency Metrics</h3>
              {sections.efficiency ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
            </button>
            
            {sections.efficiency && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <MetricCard 
                  label="Token Optimality" 
                  maxValue={5} 
                  humanValue={record.evaluation.human.efficiency.token_optimality} 
                  llmValue={record.evaluation.llm.efficiency.token_optimality}
                  type="ratio"
                  description="Ratio of useful tokens to total tokens (0-1)."
                />
                 <MetricCard 
                  label="Latency Norm." 
                  maxValue={5} 
                  humanValue={record.evaluation.human.efficiency.latency_normalized} 
                  llmValue={record.evaluation.llm.efficiency.latency_normalized}
                  type="ratio"
                />
                 <MetricCard 
                  label="Cost/Waste" 
                  maxValue={5} 
                  humanValue={record.evaluation.human.efficiency.cost_token_wasted} 
                  llmValue={record.evaluation.llm.efficiency.cost_token_wasted}
                  type="inverse"
                  description="Estimated cost of wasted tokens (lower is better)."
                />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default DetailView;

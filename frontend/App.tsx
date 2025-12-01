import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import Dashboard from './components/Dashboard';
import DetailView from './components/DetailView';
import { DataRecord } from './types';
import { useEvals } from './hooks/useEvals';

const App: React.FC = () => {
  // Use the custom hook to fetch data
  const { data: apiData, loading, error, refetch } = useEvals();
  
  const [localData, setLocalData] = useState<DataRecord[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'detail'>('dashboard');
  const [selectedRecord, setSelectedRecord] = useState<DataRecord | null>(null);

  // Sync API data with local state (to allow for manual uploads merging in the future if needed, 
  // or just simple display for now)
  useEffect(() => {
    if (apiData.length > 0) {
      setLocalData(apiData);
    }
  }, [apiData]);

  const handleSelectRecord = (record: DataRecord) => {
    setSelectedRecord(record);
    setCurrentView('detail');
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setSelectedRecord(null);
    setCurrentView('dashboard');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Supports both single object or array of objects
        const newData = Array.isArray(json) ? json : [json];
        
        // Basic validation - check if it has 'prompt' and 'evaluation'
        const validData = newData.filter((item: any) => item.prompt && item.evaluation);
        
        // Add IDs if missing
        const processedData = validData.map((item: any, idx: number) => ({
            ...item,
            id: item.id || `uploaded-${Date.now()}-${idx}`
        }));

        if (processedData.length > 0) {
            setLocalData(processedData);
        } else {
            alert("Invalid JSON format. Please ensure the file matches the required schema.");
        }
      } catch (err) {
        console.error("Error parsing JSON", err);
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30">
        {/* Navbar */}
        <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                        E
                    </div>
                    <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">EvalMetrics</span>
                </div>
                <div className="flex items-center gap-2">
                   {loading && <span className="text-xs text-slate-500 animate-pulse">Syncing...</span>}
                </div>
            </div>
        </nav>

        {loading && localData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-slate-400 gap-4">
                <Loader2 size={40} className="animate-spin text-indigo-500" />
                <p>Loading evaluation data...</p>
            </div>
        ) : error && localData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-slate-400 gap-4">
                <AlertCircle size={40} className="text-red-500" />
                <p className="text-lg font-medium text-slate-300">Failed to load data</p>
                <p className="text-sm text-slate-500 max-w-md text-center">{error}</p>
                <button 
                    onClick={() => refetch()}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors mt-2"
                >
                    <RefreshCw size={16} />
                    Retry
                </button>
            </div>
        ) : (
            <>
                {currentView === 'dashboard' && (
                    <Dashboard 
                        data={localData} 
                        onSelect={handleSelectRecord} 
                        onUpload={handleFileUpload} 
                    />
                )}

                {currentView === 'detail' && selectedRecord && (
                    <DetailView 
                        record={selectedRecord} 
                        onBack={handleBack} 
                    />
                )}
            </>
        )}
    </div>
  );
};

export default App;
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LeafScanner from './components/LeafScanner';
import DiagnosisResult from './components/DiagnosisResult';
import GardenTracker from './components/GardenTracker';
import { api } from './services/api';
import { Sprout, History, BookOpen } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('scanner');
  const [currentDiagnosis, setCurrentDiagnosis] = useState(null);
  const [alertCount, setAlertCount] = useState(0);
  const [isConnected, setIsConnected] = useState(true);

  // Poll server health and alerts on mount
  useEffect(() => {
    const checkServer = async () => {
      try {
        const health = await api.getHealth();
        setIsConnected(health.status === 'healthy');

        const alertsData = await api.getGardenAlerts();
        setAlertCount(alertsData.count || 0);
      } catch (err) {
        setIsConnected(false);
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 20000); // Poll every 20s
    return () => clearInterval(interval);
  }, []);

  const handleDiagnosisComplete = (data) => {
    setCurrentDiagnosis(data);
  };

  const handleResetScanner = () => {
    setCurrentDiagnosis(null);
  };

  const handleSavedToGarden = async () => {
    try {
      const alertsData = await api.getGardenAlerts();
      setAlertCount(alertsData.count || 0);
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alertCount={alertCount}
        isConnected={isConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Scanner Tab */}
        {activeTab === 'scanner' && (
          <div>
            {!currentDiagnosis ? (
              <LeafScanner onDiagnosisComplete={handleDiagnosisComplete} />
            ) : (
              <DiagnosisResult
                result={currentDiagnosis}
                onReset={handleResetScanner}
                onSaveToGarden={handleSavedToGarden}
                onNavigateToGarden={() => setActiveTab('garden')}
              />
            )}
          </div>
        )}

        {/* My Garden Tab */}
        {activeTab === 'garden' && (
          <GardenTracker
            onNavigateToScanner={() => setActiveTab('scanner')}
            onUpdateAlerts={handleSavedToGarden}
          />
        )}

        {/* History Tab Placeholder (Next Milestone) */}
        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
              <History className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Diagnosis History Logs</h2>
            <p className="text-slate-600 max-w-md mx-auto text-sm">
              All scans are automatically recorded to PostgreSQL via the Go API backend. Interactive history filtering is scheduled for the upcoming milestone.
            </p>
            <button
              onClick={() => setActiveTab('scanner')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition"
            >
              Start New Scan
            </button>
          </div>
        )}

        {/* Library Tab Placeholder (Next Milestone) */}
        {activeTab === 'library' && (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <BookOpen className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Plant Disease Encyclopedia</h2>
            <p className="text-slate-600 max-w-md mx-auto text-sm">
              All 38 crop disease remedies are seeded and ready in PostgreSQL (`/api/remedies`). Interactive browsing and search will be unlocked in the upcoming milestone!
            </p>
            <button
              onClick={() => setActiveTab('scanner')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition"
            >
              Explore via Scanner
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          PlantDoc &copy; 2026 &mdash; Built with Go (Gin), Python (PyTorch MobileNetV2), PostgreSQL, and React + Vite.
        </div>
      </footer>
    </div>
  );
}

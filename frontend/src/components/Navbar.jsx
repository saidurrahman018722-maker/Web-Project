import React from 'react';
import { Leaf, Sprout, History, BookOpen, Bell, Activity } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, alertCount = 0, isConnected = true }) {
  const tabs = [
    { id: 'scanner', label: 'Leaf Scanner', icon: Leaf },
    { id: 'garden', label: 'My Garden', icon: Sprout, badge: alertCount },
    { id: 'history', label: 'Diagnosis History', icon: History },
    { id: 'library', label: 'Disease Library', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('scanner')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                  PlantDoc
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  AI + Go
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Intelligent Crop Diagnostic & Care</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{tab.label}</span>

                  {tab.badge > 0 && (
                    <span
                      className={`inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold rounded-full ${
                        isActive
                          ? 'bg-white text-emerald-700'
                          : 'bg-amber-500 text-white animate-pulse'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Server Status Indicator */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span className="text-slate-600">
              {isConnected ? 'Go Backend Online' : 'Backend Disconnected'}
            </span>
          </div>

        </div>
      </div>
    </header>
  );
}

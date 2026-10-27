import React from 'react';
import { ShieldCheck, UserCheck, RefreshCw, Sparkles, BookOpen, Layers, BarChart3, Clock } from 'lucide-react';

export default function Header({
  activeRole,
  setActiveRole,
  activeTab,
  setActiveTab,
  queueCount,
  onResetDemo,
  isResetting
}) {
  const roles = [
    { id: 'creator', label: 'Creator', name: 'Alex Vance', icon: Sparkles },
    { id: 'manager', label: 'Manager', name: 'Jordan Lee', icon: ShieldCheck },
    { id: 'reviewer', label: 'Reviewer', name: 'Morgan Reed', icon: UserCheck }
  ];

  return (
    <header className="border-b border-gray-800 bg-gray-900/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-900/20">
              <ShieldCheck className="w-6 h-6 text-gray-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white">SENTINEL</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  MVP v1.0
                </span>
              </div>
              <p className="text-xs text-gray-400">Grounded Brand & Compliance Engine</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-gray-950/60 p-1 rounded-xl border border-gray-800">
            <button
              onClick={() => setActiveTab('review')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'review'
                  ? 'bg-amber-500 text-gray-950 shadow'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Review Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('queue')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition relative ${
                activeTab === 'queue'
                  ? 'bg-amber-500 text-gray-950 shadow'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Review Queue</span>
              {queueCount > 0 && (
                <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  activeTab === 'queue' ? 'bg-gray-900 text-amber-400' : 'bg-amber-500 text-gray-950'
                }`}>
                  {queueCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('knowledge')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'knowledge'
                  ? 'bg-amber-500 text-gray-950 shadow'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Knowledge Base</span>
            </button>

            <button
              onClick={() => setActiveTab('insights')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'insights'
                  ? 'bg-amber-500 text-gray-950 shadow'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Insights & Gaps</span>
            </button>
          </nav>

          {/* Role Switcher & Reset Demo */}
          <div className="flex items-center space-x-3">
            {/* Persistent Role Switcher Pill */}
            <div className="flex items-center bg-gray-950/80 p-1 rounded-xl border border-gray-800">
              <span className="text-[11px] font-medium text-gray-400 px-2 hidden sm:inline">Role:</span>
              <div className="flex space-x-1">
                {roles.map(r => {
                  const Icon = r.icon;
                  const isActive = activeRole === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setActiveRole(r.id)}
                      title={`${r.label} (${r.name})`}
                      className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                        isActive
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span className="font-semibold">{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reset Demo Button */}
            <button
              onClick={onResetDemo}
              disabled={isResetting}
              title="Reset Demo to Nimbus Coffee default state"
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition border border-gray-800 hover:border-gray-700"
            >
              <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

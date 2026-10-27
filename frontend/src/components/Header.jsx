import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, UserCheck, RefreshCw, Sparkles, BookOpen,
  Layers, BarChart3, Clock, Home, Database, CreditCard, LogIn, User
} from 'lucide-react';

export default function Header({
  activeRole,
  setActiveRole,
  activeTab,
  setActiveTab,
  queueCount,
  onResetDemo,
  isResetting,
  currentUser,
  onOpenAuthModal,
  onLogout
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
          <Link to="/" className="flex items-center space-x-3 group transition" title="Go to Home / Landing Page">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-900/20 group-hover:scale-105 transition">
              <ShieldCheck className="w-6 h-6 text-gray-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-amber-400 transition">SENTINEL</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  MVP v1.0
                </span>
              </div>
              <p className="text-xs text-gray-400">Grounded Brand & Compliance Engine</p>
            </div>
          </Link>

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

            {/* Sole Developer Admin Database CRM Link */}
            {currentUser?.email?.toLowerCase()?.trim() === 'devgania1@gmail.com' && (
              <Link
                to="/admin"
                title="Access Developer Customer Database & Access Whitelist"
                className="flex items-center space-x-1 px-2.5 py-1.5 text-xs text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition border border-amber-500/30 font-semibold"
              >
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Customer DB</span>
              </Link>
            )}

            {/* Logged in Customer Details & Greeting */}
            {currentUser ? (
              <div className="flex items-center space-x-2 bg-gray-950/90 p-1 pl-2.5 rounded-2xl border border-gray-800 shadow-sm">
                {/* Greeting & Avatar */}
                <div className="flex items-center space-x-2">
                  {currentUser.picture ? (
                    <img
                      src={currentUser.picture}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full border border-amber-500/40 object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-gray-950 font-extrabold text-xs flex items-center justify-center shadow-sm shrink-0">
                      {(currentUser.name || currentUser.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="text-left leading-tight hidden lg:block">
                    <div className="text-xs font-bold text-white flex items-center space-x-1">
                      <span>Hello,</span>
                      <span className="text-amber-400 font-extrabold truncate max-w-[120px]">
                        {currentUser.name || currentUser.email.split('@')[0]}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 truncate max-w-[120px]">
                      {currentUser.brand_name || currentUser.company_name || currentUser.email}
                    </div>
                  </div>
                </div>

                {/* Plan Badge */}
                <button
                  onClick={() => onOpenAuthModal && onOpenAuthModal('subscription', currentUser.subscription_tier)}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition cursor-pointer ${
                    currentUser.subscription_tier === 'pro'
                      ? 'bg-purple-500/15 text-purple-300 border-purple-500/40 hover:bg-purple-500/25'
                      : currentUser.subscription_tier === 'enterprise'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                      : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-750'
                  }`}
                  title="Subscription Plan (Click to upgrade)"
                >
                  <CreditCard className="w-3 h-3 text-amber-400" />
                  <span>{currentUser.subscription_tier || 'Starter'}</span>
                </button>

                {/* Sign Out */}
                <button
                  onClick={onLogout}
                  className="px-2 py-1 text-[11px] font-semibold text-gray-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition cursor-pointer"
                  title="Sign Out of Customer Workspace"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
                className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 font-bold rounded-lg text-xs hover:from-amber-400 hover:to-amber-500 shadow-sm transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Public Site Link */}
            <Link
              to="/"
              title="Return to Public Website"
              className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition border border-gray-800 hover:border-gray-700 font-medium"
            >
              <Home className="w-3.5 h-3.5 text-amber-400" />
              <span>Website</span>
            </Link>

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

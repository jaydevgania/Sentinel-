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
    <header className="glass-panel border-b border-white/10 sticky top-0 z-50 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group transition" title="Go to Home / Landing Page">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-105 group-hover:shadow-amber-500/40 transition-all">
              <ShieldCheck className="w-6 h-6 text-gray-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-xl tracking-wider text-white group-hover:text-amber-400 transition-colors">SENTINEL</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  MVP v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Grounded Compliance Engine</p>
            </div>
          </Link>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 glass-panel-subtle p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveTab('review')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'review'
                  ? 'glass-button-primary text-gray-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Review Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('queue')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                activeTab === 'queue'
                  ? 'glass-button-primary text-gray-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Review Queue</span>
              {queueCount > 0 && (
                <span className={`ml-1 text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                  activeTab === 'queue' ? 'bg-gray-950 text-amber-400' : 'bg-amber-400 text-gray-950'
                }`}>
                  {queueCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('knowledge')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'knowledge'
                  ? 'glass-button-primary text-gray-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{currentUser ? 'Company Guidelines' : 'Knowledge Base'}</span>
            </button>

            <button
              onClick={() => setActiveTab('insights')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'insights'
                  ? 'glass-button-primary text-gray-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Insights &amp; Gaps</span>
            </button>
          </nav>

          {/* Role Switcher & Reset Demo */}
          <div className="flex items-center space-x-3">
            {/* Persistent Role Switcher Pill */}
            <div className="flex items-center glass-panel-subtle p-1 rounded-2xl border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 hidden sm:inline">Role:</span>
              <div className="flex space-x-1">
                {roles.map(r => {
                  const Icon = r.icon;
                  const isActive = activeRole === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setActiveRole(r.id)}
                      title={`${r.label} (${r.name})`}
                      className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
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
                className="flex items-center space-x-1 px-3 py-1.5 text-xs text-amber-300 hover:text-white bg-amber-500/15 hover:bg-amber-500/25 rounded-xl transition border border-amber-500/40 font-bold"
              >
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Customer DB</span>
              </Link>
            )}

            {/* Logged in Customer Details & Greeting */}
            {currentUser ? (
              <div className="flex items-center space-x-2 glass-pill p-1 pl-2.5 rounded-2xl border border-white/10 shadow-sm">
                {/* Greeting & Avatar */}
                <div className="flex items-center space-x-2">
                  {currentUser.picture ? (
                    <img
                      src={currentUser.picture}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full border border-amber-500/40 object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-gray-950 font-black text-xs flex items-center justify-center shadow-sm shrink-0">
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
                    <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                      {currentUser.brand_name || currentUser.company_name || currentUser.email}
                    </div>
                  </div>
                </div>

                {/* Plan Badge */}
                <button
                  onClick={() => onOpenAuthModal && onOpenAuthModal('subscription', currentUser.subscription_tier)}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition cursor-pointer ${
                    currentUser.subscription_tier === 'pro'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30'
                      : currentUser.subscription_tier === 'enterprise'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                  title="Subscription Plan (Click to upgrade)"
                >
                  <CreditCard className="w-3 h-3 text-amber-400" />
                  <span>{currentUser.subscription_tier || 'Starter'}</span>
                </button>

                {/* Sign Out */}
                <button
                  onClick={onLogout}
                  className="px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition cursor-pointer"
                  title="Sign Out of Customer Workspace"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
                className="glass-button-primary flex items-center space-x-1 px-3.5 py-1.5 text-gray-950 font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Public Site Link */}
            <Link
              to="/"
              title="Return to Public Website"
              className="hidden sm:flex items-center space-x-1 px-3 py-1.5 text-xs text-slate-300 hover:text-white glass-pill rounded-xl transition font-medium"
            >
              <Home className="w-3.5 h-3.5 text-amber-400" />
              <span>Website</span>
            </Link>

            {/* Reset Demo Button */}
            <button
              onClick={onResetDemo}
              disabled={isResetting}
              title="Reset Demo to Nimbus Coffee default state"
              className="p-2 text-slate-400 hover:text-white glass-pill rounded-xl transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

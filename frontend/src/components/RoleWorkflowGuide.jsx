import React, { useState } from 'react';
import {
  Sparkles, ShieldCheck, UserCheck, ArrowRight, CheckCircle2,
  Clock, FileText, Upload, Shield, Lock, Eye, ChevronDown, ChevronUp, Zap
} from 'lucide-react';

export default function RoleWorkflowGuide({
  activeRole,
  setActiveRole,
  activeTab,
  setActiveTab,
  queueCount,
  onOpenGuidelinesModal,
  onOpenCompanionModal,
  onQuickDemoLogin,
  currentUser
}) {
  const [collapsed, setCollapsed] = useState(false);

  const workflows = {
    creator: {
      roleTitle: 'Content Creator Workflow',
      badge: 'Authoring & Self-Correction',
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      description: 'Draft marketing copy, press releases, or visual banners with real-time AI guidance, resolve findings with minimal intent-preserving edits, and submit for formal manager review.',
      demoUser: 'creator@sentinel.ai',
      demoName: 'Alex Vance',
      steps: [
        {
          num: '1',
          title: 'Draft & Select Copy',
          desc: 'Select a benchmark post or paste campaign copy',
          targetTab: 'review',
          active: activeTab === 'review'
        },
        {
          num: '2',
          title: 'Run Grounded Check',
          desc: 'Check tone, claims, WCAG contrast & ASCI/FTC rules',
          targetTab: 'review',
          active: activeTab === 'review'
        },
        {
          num: '3',
          title: 'Resolve In-Line Findings',
          desc: 'Accept fix, edit in-place, reject or dispute rules',
          targetTab: 'review',
          active: activeTab === 'review'
        },
        {
          num: '4',
          title: 'Submit for Approval',
          desc: 'Send to manager queue (creators cannot self-approve)',
          targetTab: 'queue',
          active: activeTab === 'queue'
        }
      ],
      actions: [
        {
          label: 'Test Inline Companion (Docs)',
          icon: Sparkles,
          onClick: onOpenCompanionModal,
          primary: true
        },
        {
          label: 'Switch to Manager View',
          icon: ShieldCheck,
          onClick: () => {
            setActiveRole('manager');
            setActiveTab('queue');
          }
        }
      ]
    },
    manager: {
      roleTitle: 'Brand Marketing Manager Workflow',
      badge: 'Approval & Release Gatekeeper',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      description: 'Review incoming submissions from creators, inspect side-by-side visual diffs between author copy and revisions, approve with digital sign-off, or request changes before publication.',
      demoUser: 'manager@sentinel.ai',
      demoName: 'Jordan Lee',
      steps: [
        {
          num: '1',
          title: 'Review Inbox & Queue',
          desc: `${queueCount} pending submissions awaiting decision`,
          targetTab: 'queue',
          active: activeTab === 'queue'
        },
        {
          num: '2',
          title: 'Inspect Visual Diff',
          desc: 'Review side-by-side changes & intent preservation',
          targetTab: 'queue',
          active: activeTab === 'queue'
        },
        {
          num: '3',
          title: 'Manager Sign-Off Decision',
          desc: 'Approve, request revisions, or reject with notes',
          targetTab: 'queue',
          active: activeTab === 'queue'
        },
        {
          num: '4',
          title: 'Chained Audit Record',
          desc: 'Decision written to immutable SHA-256 blockchain log',
          targetTab: 'insights',
          active: activeTab === 'insights'
        }
      ],
      actions: [
        {
          label: `Open Approval Queue (${queueCount})`,
          icon: Clock,
          onClick: () => setActiveTab('queue'),
          primary: true
        },
        {
          label: 'Direct Studio Review',
          icon: Sparkles,
          onClick: () => setActiveTab('review')
        },
        {
          label: 'Switch to Compliance Officer',
          icon: UserCheck,
          onClick: () => {
            setActiveRole('reviewer');
            setActiveTab('knowledge');
          }
        }
      ]
    },
    reviewer: {
      roleTitle: 'Compliance & Legal Officer Workflow',
      badge: 'Policy, Governance & Audit',
      badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      description: 'Manage brand guidelines (PDF/DOCX), calibrate multi-jurisdiction advertising laws (ASCI, FTC, EU Green Claims), review Guideline-Gap disputes, and verify tamper-evident audit logs.',
      demoUser: 'compliance@sentinel.ai',
      demoName: 'Morgan Reed',
      steps: [
        {
          num: '1',
          title: 'Upload Guidelines (PDF)',
          desc: 'Import brand books & policy clauses into Knowledge Base',
          targetTab: 'knowledge',
          active: activeTab === 'knowledge'
        },
        {
          num: '2',
          title: 'Jurisdiction Calibration',
          desc: 'Configure ASCI, FTC, EU & Hinglish voice allowlists',
          targetTab: 'knowledge',
          active: activeTab === 'knowledge'
        },
        {
          num: '3',
          title: 'Guideline-Gap Detector',
          desc: 'Aggregate creator disputes & refine ambiguous rules',
          targetTab: 'insights',
          active: activeTab === 'insights'
        },
        {
          num: '4',
          title: 'Cryptographic Audit Proof',
          desc: 'Verify unbroken SHA-256 chain continuity (/api/audit)',
          targetTab: 'insights',
          active: activeTab === 'insights'
        }
      ],
      actions: [
        {
          label: 'Upload Brand Guidelines (PDF/DOCX)',
          icon: Upload,
          onClick: onOpenGuidelinesModal,
          primary: true
        },
        {
          label: 'Inspect Gap Detector & Audit',
          icon: Shield,
          onClick: () => setActiveTab('insights')
        },
        {
          label: 'Switch to Creator Role',
          icon: Sparkles,
          onClick: () => {
            setActiveRole('creator');
            setActiveTab('review');
          }
        }
      ]
    }
  };

  const currentWorkflow = workflows[activeRole] || workflows.creator;

  return (
    <div className="glass-panel border border-white/10 rounded-3xl p-4 sm:p-5 shadow-2xl transition-all">
      {/* Top Banner Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-gray-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
            {activeRole === 'creator' ? <Sparkles className="w-5 h-5" /> :
             activeRole === 'manager' ? <ShieldCheck className="w-5 h-5" /> :
             <UserCheck className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-extrabold text-white">
                {currentWorkflow.roleTitle}
              </h2>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${currentWorkflow.badgeColor}`}>
                {currentWorkflow.badge}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
              {currentWorkflow.description}
            </p>
          </div>
        </div>

        {/* Demo Switcher Quick Buttons & Collapse */}
        <div className="flex items-center space-x-2 self-start md:self-center shrink-0">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 text-xs">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider px-2 hidden sm:inline">
              Demo Role:
            </span>
            <button
              onClick={() => {
                setActiveRole('creator');
                if (onQuickDemoLogin) onQuickDemoLogin('creator');
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeRole === 'creator'
                  ? 'bg-amber-500 text-gray-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Creator
            </button>
            <button
              onClick={() => {
                setActiveRole('manager');
                if (onQuickDemoLogin) onQuickDemoLogin('manager');
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeRole === 'manager'
                  ? 'bg-amber-500 text-gray-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Manager
            </button>
            <button
              onClick={() => {
                setActiveRole('reviewer');
                if (onQuickDemoLogin) onQuickDemoLogin('compliance');
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeRole === 'reviewer'
                  ? 'bg-amber-500 text-gray-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Compliance
            </button>
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition"
            title={collapsed ? 'Expand Workflow Guide' : 'Collapse Workflow Guide'}
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Workflow Steps */}
      {!collapsed && (
        <div className="pt-4 space-y-4 animate-in fade-in">
          {/* Step Breadcrumbs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {currentWorkflow.steps.map((st, idx) => (
              <button
                key={st.num}
                onClick={() => setActiveTab(st.targetTab)}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer relative overflow-hidden group ${
                  st.active
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-sm ring-1 ring-amber-500/20'
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      st.active ? 'bg-amber-400 text-gray-950' : 'bg-white/10 text-slate-300'
                    }`}>
                      {st.num}
                    </span>
                    <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                      {st.title}
                    </span>
                  </div>
                  {st.active && (
                    <span className="text-[9px] uppercase font-bold text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1 leading-snug">
                  {st.desc}
                </p>
              </button>
            ))}
          </div>

          {/* Quick Action Shortcuts & Demo Credentials Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
            {/* Demo Credentials Notice for Judges */}
            <div className="flex items-center space-x-2 text-slate-300">
              <div className="flex items-center space-x-1 font-mono text-[11px] bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                <span>Demo Account:</span>
                <strong className="text-amber-300">{currentWorkflow.demoUser}</strong>
                <span className="text-slate-500">&bull;</span>
                <span>Pwd:</span>
                <strong className="text-emerald-400 font-bold">demo123</strong>
              </div>
            </div>

            {/* Role Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {currentWorkflow.actions.map((act, i) => {
                const Icon = act.icon;
                return (
                  <button
                    key={i}
                    onClick={act.onClick}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer shadow-sm ${
                      act.primary
                        ? 'glass-button-primary text-gray-950 shadow-amber-500/20'
                        : 'glass-button-secondary text-slate-200 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{act.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

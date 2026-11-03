import React, { useState, useEffect } from 'react';
import {
  Sparkles, ShieldCheck, AlertCircle, Send, CheckCircle2,
  FileText, Upload, RefreshCw, Layers, Check, CreditCard,
  Globe, Compass, Eye
} from 'lucide-react';
import Header from './components/Header';
import SamplePicker from './components/SamplePicker';
import FindingsStudio from './components/FindingsStudio';
import ReviewQueueScreen from './components/ReviewQueueScreen';
import KnowledgeBaseScreen from './components/KnowledgeBaseScreen';
import InsightsScreen from './components/InsightsScreen';
import AuthModal from './components/AuthModal';
import UploadGuidelinesModal from './components/UploadGuidelinesModal';
import VisualInspectionViewer from './components/VisualInspectionViewer';
import CompanionSimulatorModal from './components/CompanionSimulatorModal';
import RoleWorkflowGuide from './components/RoleWorkflowGuide';
import { useAuth } from './context/AuthContext';
import {
  fetchWorkspace, resetDemo, submitReview, getReview, fetchQueue, demoLogin
} from './api';

export default function App() {
  const { user: currentUser, logout: handleLogout, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('review');
  const [activeRole, setActiveRole] = useState(currentUser?.role || 'creator');
  const [workspace, setWorkspace] = useState(null);
  const [samples, setSamples] = useState([]);
  const [selectedSample, setSelectedSample] = useState(null);

  // Auth modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [authSelectedPlan, setAuthSelectedPlan] = useState('pro');

  // Customer Guidelines Upload Modal
  const [guidelinesModalOpen, setGuidelinesModalOpen] = useState(false);

  // Form State
  const [channel, setChannel] = useState('instagram');
  const [purpose, setPurpose] = useState('Promotional launch announcement');
  const [jurisdiction, setJurisdiction] = useState('global');
  const [bodyText, setBodyText] = useState('');
  const [imageMetadata, setImageMetadata] = useState(null);

  // Companion Simulator Modal (Round 3 Improvement 1)
  const [companionModalOpen, setCompanionModalOpen] = useState(false);

  // Review State
  const [currentReview, setCurrentReview] = useState(null);
  const [checking, setChecking] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [queueCount, setQueueCount] = useState(0);

  // Toast Notification System
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  // Initialize
  const initializeApp = async () => {
    try {
      const data = await fetchWorkspace();
      setWorkspace(data.workspace);
      setSamples(data.sample_posts || []);

      // Auto-load sample 1 by default so the workspace is immediately alive
      if (data.sample_posts && data.sample_posts.length > 0) {
        const s1 = data.sample_posts[0];
        setSelectedSample(s1);
        setChannel(s1.channel);
        setPurpose(s1.purpose);
        setBodyText(s1.text);
        setImageMetadata(s1.metadata || null);
      }

      // Update queue count
      const q = await fetchQueue();
      setQueueCount(q.length);
    } catch (err) {
      console.error('Initialization error:', err);
    }
  };

  useEffect(() => {
    initializeApp();
  }, []);

  const handleOpenAuth = (mode = 'login', plan = 'pro') => {
    setAuthModalMode(mode);
    setAuthSelectedPlan(plan);
    setAuthModalOpen(true);
  };

  const handleQuickDemoLogin = async (role) => {
    try {
      const res = await demoLogin(role);
      if (refreshProfile) await refreshProfile();
      setActiveRole(role === 'compliance' ? 'reviewer' : role);
      showToast(`1-Click Demo Login: ${res.user?.name || role} (${res.user?.role || role})`);
    } catch (err) {
      console.error('Demo login error:', err);
      showToast(`Login failed: ${err.message}`, 'error');
    }
  };

  const handleSelectSample = (sample) => {
    setSelectedSample(sample);
    setChannel(sample.channel);
    setPurpose(sample.purpose);
    setBodyText(sample.text);
    setJurisdiction(sample.jurisdiction || 'global');
    setImageMetadata(sample.metadata || (sample.id === 'sample-5' ? { is_image: true, foreground_color: '#8A9BA8', background_color: '#FFFFFF' } : null));
    showToast(`Loaded ${sample.title} (${sample.jurisdiction || 'Global'})`);
  };

  const handleCheckContent = async () => {
    if (!bodyText.trim()) {
      showToast('Please enter or select content to review.', 'warning');
      return;
    }

    try {
      setChecking(true);
      const payload = {
        channel,
        purpose,
        body_text: bodyText,
        jurisdiction: jurisdiction || 'global',
        ...(currentUser?.workspace_id ? { workspace_id: currentUser.workspace_id, author_id: currentUser.id } : {})
      };
      if (imageMetadata?.is_image || selectedSample?.id === 'sample-5') {
        payload.image_base64 = "seeded_demo_banner";
      }

      const reviewRes = await submitReview(payload);
      // Fetch enriched review with fact/rule previews
      const enriched = await getReview(reviewRes.id);
      setCurrentReview(enriched);

      // Refresh user's review count in database
      if (refreshProfile) refreshProfile().catch(() => {});

      // Update queue count
      const q = await fetchQueue();
      setQueueCount(q.length);
      showToast(`Analysis complete: Score ${enriched.compliance_score}/100 &bull; ${enriched.findings?.length || 0} findings`);
    } catch (err) {
      showToast(`Review check failed: ${err.message}`, 'error');
    } finally {
      setChecking(false);
    }
  };

  // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to run check
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (activeTab === 'review' && !checking && bodyText.trim()) {
          handleCheckContent();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, checking, bodyText, channel, purpose, jurisdiction, imageMetadata, currentUser]);

  const handleReviewUpdated = async () => {
    if (currentReview) {
      const updated = await getReview(currentReview.id);
      setCurrentReview(updated);
      const q = await fetchQueue();
      setQueueCount(q.length);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset demo to fresh Nimbus Coffee guidelines and sample posts?')) return;
    try {
      setIsResetting(true);
      await resetDemo();
      await initializeApp();
      setCurrentReview(null);
      alert('Demo workspace reset successfully!');
    } catch (err) {
      alert(`Reset failed: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Persistent Header with Role Switcher & Auth */}
      <Header
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        queueCount={queueCount}
        onResetDemo={handleReset}
        isResetting={isResetting}
        currentUser={currentUser}
        onOpenAuthModal={handleOpenAuth}
        onLogout={handleLogout}
        onQuickDemoLogin={handleQuickDemoLogin}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Active Role Workflow Guide Banner (All Roles Enabled) */}
        <RoleWorkflowGuide
          activeRole={activeRole}
          setActiveRole={setActiveRole}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          queueCount={queueCount}
          onOpenGuidelinesModal={() => setGuidelinesModalOpen(true)}
          onOpenCompanionModal={() => setCompanionModalOpen(true)}
          onQuickDemoLogin={handleQuickDemoLogin}
          currentUser={currentUser}
        />

        {/* Customer Welcome & Identity Banner */}
        {currentUser && (
          <div className="p-4 rounded-3xl glass-panel border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xl">
            <div className="flex items-center space-x-3.5">
              {currentUser.picture ? (
                <img
                  src={currentUser.picture}
                  alt={currentUser.name}
                  className="w-11 h-11 rounded-2xl border-2 border-amber-500/40 object-cover shadow-md shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-gray-950 font-black text-lg flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
                  {(currentUser.name || currentUser.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-base font-extrabold text-white flex items-center space-x-2">
                  <span>Hello, {currentUser.name || currentUser.email.split('@')[0]}!</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    Active Workspace
                  </span>
                  {currentUser.email?.endsWith('@sentinel.ai') && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Judge Demo Account (PWD: demo123)
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                  <span>Work Email: <strong className="text-slate-200 font-mono">{currentUser.email}</strong></span>
                  <span className="text-slate-600">&bull;</span>
                  <span>Brand: <strong className="text-amber-400">{currentUser.brand_name || currentUser.company_name || 'Brand Workspace'}</strong></span>
                  <span className="text-slate-600">&bull;</span>
                  <span>Role: <strong className="text-slate-300 capitalize">{currentUser.role || 'manager'}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 shrink-0 self-end sm:self-center">
              <div className="text-right hidden sm:block">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tier</div>
                <div className="text-xs font-bold text-amber-400 capitalize">{currentUser.subscription_tier || 'Starter'} Plan</div>
              </div>
              <button
                onClick={() => setGuidelinesModalOpen(true)}
                className="glass-button-primary px-3.5 py-1.5 font-bold rounded-xl text-xs text-gray-950 flex items-center space-x-1.5 cursor-pointer shadow-md"
                title="Upload PDF, DOCX or TXT company guidelines"
              >
                <Upload className="w-3.5 h-3.5 text-gray-950" />
                <span>Upload Guidelines</span>
              </button>
              <button
                onClick={() => handleOpenAuth('subscription', currentUser.subscription_tier)}
                className="glass-button-secondary px-3 py-1.5 text-slate-200 font-semibold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                <span>Upgrade Plan</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: REVIEW STUDIO */}
        {activeTab === 'review' && (
          <div className="space-y-6">
            {/* Seeded Quick-Test Suite */}
            <SamplePicker
              samples={samples}
              onSelectSample={handleSelectSample}
              activeSampleId={selectedSample?.id}
            />

            {/* Input & Check Card */}
            <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Input Marketing Copy
                  </span>
                  <span className="text-[11px] text-slate-400">
                    &bull; Target Brand: <strong className="text-amber-400">{currentUser?.brand_name || currentUser?.company_name || 'Nimbus Coffee'}</strong>
                  </span>
                  <button
                    onClick={() => setGuidelinesModalOpen(true)}
                    className="text-[10px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30 transition flex items-center space-x-1 cursor-pointer"
                  >
                    <Upload className="w-2.5 h-2.5" />
                    <span>Upload Guidelines (PDF/DOCX)</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Channel Dropdown */}
                  <div className="flex items-center space-x-1 text-xs">
                    <span className="text-slate-400">Channel:</span>
                    <select
                      value={channel}
                      onChange={(e) => setChannel(e.target.value)}
                      className="glass-input rounded-xl px-2.5 py-1 text-xs text-white outline-none"
                    >
                      <option value="instagram" className="bg-[#0b0f19]">Instagram</option>
                      <option value="press_release" className="bg-[#0b0f19]">Press Release</option>
                      <option value="website" className="bg-[#0b0f19]">Website / E-Commerce</option>
                      <option value="internal" className="bg-[#0b0f19]">Internal Memo</option>
                    </select>
                  </div>

                  {/* Jurisdiction Dropdown (Round 3 Improvement 3) */}
                  <div className="flex items-center space-x-1 text-xs">
                    <span className="text-slate-400">Jurisdiction:</span>
                    <select
                      value={jurisdiction}
                      onChange={(e) => setJurisdiction(e.target.value)}
                      className="glass-input rounded-xl px-2.5 py-1 text-xs text-amber-300 font-medium outline-none border border-amber-500/30"
                    >
                      <option value="global" className="bg-[#0b0f19]">Global (General Standards)</option>
                      <option value="india_asci" className="bg-[#0b0f19]">India (ASCI &amp; Regional Voice)</option>
                      <option value="us_ftc" className="bg-[#0b0f19]">USA (FTC 16 CFR 255)</option>
                      <option value="eu_green" className="bg-[#0b0f19]">EU (Directive 2024/825)</option>
                      <option value="uk_asa" className="bg-[#0b0f19]">UK (ASA / CAP Code)</option>
                    </select>
                  </div>

                  {/* Purpose */}
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Campaign Purpose..."
                    className="glass-input rounded-xl px-2.5 py-1 text-xs text-white outline-none w-36 placeholder-slate-500"
                  />

                  {/* Inline Companion Simulator Button (Round 3 Improvement 1) */}
                  <button
                    onClick={() => setCompanionModalOpen(true)}
                    className="text-xs font-bold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1 rounded-xl border border-cyan-500/30 transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
                    title="Launch real-time Inline Authoring Companion simulator (Chrome Extension V3)"
                  >
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Inline Companion Demo</span>
                  </button>
                </div>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  value={bodyText}
                  onChange={(e) => {
                    setBodyText(e.target.value);
                    setSelectedSample(null);
                  }}
                  rows={4}
                  placeholder="Paste marketing copy, press release, or social media caption here..."
                  className="glass-input w-full rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 outline-none resize-y leading-relaxed"
                />
              </div>

              {/* Image / Metadata notice if sample 5 */}
              {imageMetadata?.is_image && (
                <div className="glass-panel-subtle border-cyan-500/30 p-3 rounded-2xl text-xs text-cyan-300 flex items-center justify-between">
                  <span>
                    Simulated Banner Graphic Attached: Contrast Ratio {imageMetadata.foreground_color} on {imageMetadata.background_color} (1.3:1) &bull; Alt text missing
                  </span>
                  <span className="text-[10px] uppercase font-bold text-cyan-400">Visual Check Active</span>
                </div>
              )}

              {/* Action Button: Check Content */}
              <div className="flex items-center justify-between pt-1">
                <div className="text-[11px] text-slate-400">
                  Runs parallel Deterministic &amp; Grounded AI checks with PII scrubbing
                </div>

                <button
                  onClick={handleCheckContent}
                  disabled={checking}
                  className="glass-button-primary flex items-center space-x-2 text-gray-950 font-black px-6 py-2.5 rounded-xl text-xs shadow-xl shadow-amber-500/25 transition transform active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
                  <span>{checking ? 'Analyzing Guidelines...' : 'Check Content with Sentinel'}</span>
                </button>
              </div>
            </div>

            {/* Visual Inspection Viewer (Round 3 Improvement 2) */}
            {currentReview?.visual_inspection && (
              <VisualInspectionViewer visualData={currentReview.visual_inspection} />
            )}

            {/* Findings Studio (renders findings when checked) */}
            {currentReview && (
              <FindingsStudio
                review={currentReview}
                activeRole={activeRole}
                onReviewUpdated={handleReviewUpdated}
                onSubmitForApprovalSuccess={() => {
                  alert('Submission sent to Manager Approval Queue!');
                  setActiveTab('queue');
                }}
              />
            )}
          </div>
        )}

        {/* TAB 2: REVIEW QUEUE */}
        {activeTab === 'queue' && (
          <ReviewQueueScreen
            activeRole={activeRole}
            onSelectReview={async (id) => {
              const enriched = await getReview(id);
              setCurrentReview(enriched);
              setActiveTab('review');
            }}
          />
        )}

        {/* TAB 3: KNOWLEDGE BASE */}
        {activeTab === 'knowledge' && (
          <KnowledgeBaseScreen
            currentUser={currentUser}
            onOpenUploadModal={() => setGuidelinesModalOpen(true)}
          />
        )}

        {/* TAB 4: INSIGHTS & GAPS */}
        {activeTab === 'insights' && (
          <InsightsScreen />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-gray-950 py-4 text-center text-xs text-gray-400">
        <p>
          Sentinel &bull; CodeStar 30 Round 3 Final Submission &bull; Team SENTINEL ARK (Jay Devgania, Dharmi Gor, Hazel Kanabar, Shiv Kumbhar)
        </p>
      </footer>

      {/* Customer Auth & Subscription Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        selectedPlan={authSelectedPlan}
        onSuccess={() => {
          if (refreshProfile) refreshProfile().catch(() => {});
        }}
      />

      {/* Company Brand Guidelines Upload Modal */}
      <UploadGuidelinesModal
        isOpen={guidelinesModalOpen}
        onClose={() => setGuidelinesModalOpen(false)}
        currentUser={currentUser}
        onUploadSuccess={() => {
          if (refreshProfile) refreshProfile().catch(() => {});
        }}
        onNavigateToStudio={() => setActiveTab('review')}
      />

      {/* Real-Time Inline Authoring Companion Simulator (Round 3 Improvement 1) */}
      <CompanionSimulatorModal
        isOpen={companionModalOpen}
        onClose={() => setCompanionModalOpen(false)}
      />

      {/* Floating Glassmorphic Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 rounded-2xl glass-panel border border-amber-500/40 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-300">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs font-bold text-white tracking-wide">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

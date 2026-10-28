import React, { useState, useEffect } from 'react';
import {
  Sparkles, ShieldCheck, AlertCircle, Send, CheckCircle2,
  FileText, Upload, RefreshCw, Layers, Check, CreditCard
} from 'lucide-react';
import Header from './components/Header';
import SamplePicker from './components/SamplePicker';
import FindingsStudio from './components/FindingsStudio';
import ReviewQueueScreen from './components/ReviewQueueScreen';
import KnowledgeBaseScreen from './components/KnowledgeBaseScreen';
import InsightsScreen from './components/InsightsScreen';
import AuthModal from './components/AuthModal';
import UploadGuidelinesModal from './components/UploadGuidelinesModal';
import { useAuth } from './context/AuthContext';
import {
  fetchWorkspace, resetDemo, submitReview, getReview, fetchQueue
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
  const [bodyText, setBodyText] = useState('');
  const [imageMetadata, setImageMetadata] = useState(null);

  // Review State
  const [currentReview, setCurrentReview] = useState(null);
  const [checking, setChecking] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [queueCount, setQueueCount] = useState(0);

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

  const handleSelectSample = (sample) => {
    setSelectedSample(sample);
    setChannel(sample.channel);
    setPurpose(sample.purpose);
    setBodyText(sample.text);
    setImageMetadata(sample.metadata || null);
  };

  const handleCheckContent = async () => {
    if (!bodyText.trim()) {
      alert('Please enter or select content to review.');
      return;
    }

    try {
      setChecking(true);
      const payload = {
        channel,
        purpose,
        body_text: bodyText,
        ...(currentUser?.workspace_id ? { workspace_id: currentUser.workspace_id, author_id: currentUser.id } : {})
      };
      if (imageMetadata?.is_image) {
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
    } catch (err) {
      alert(`Review check failed: ${err.message}`);
    } finally {
      setChecking(false);
    }
  };

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
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
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
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Customer Welcome & Identity Banner */}
        {currentUser && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-900 to-gray-850 border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center space-x-3.5">
              {currentUser.picture ? (
                <img
                  src={currentUser.picture}
                  alt={currentUser.name}
                  className="w-11 h-11 rounded-2xl border-2 border-amber-500/40 object-cover shadow-md shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-gray-950 font-black text-lg flex items-center justify-center shadow-lg shadow-amber-900/30 shrink-0">
                  {(currentUser.name || currentUser.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-base font-extrabold text-white flex items-center space-x-2">
                  <span>Hello, {currentUser.name || currentUser.email.split('@')[0]}!</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Logged In
                  </span>
                </div>
                <div className="text-xs text-gray-400 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                  <span>Work Email: <strong className="text-gray-200 font-mono">{currentUser.email}</strong></span>
                  <span className="text-gray-600">&bull;</span>
                  <span>Brand Workspace: <strong className="text-amber-400">{currentUser.brand_name || currentUser.company_name || 'Brand Workspace'}</strong></span>
                  <span className="text-gray-600">&bull;</span>
                  <span>Role: <strong className="text-gray-300 capitalize">{currentUser.role || 'manager'}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 shrink-0 self-end sm:self-center">
              <div className="text-right hidden sm:block">
                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Subscription</div>
                <div className="text-xs font-bold text-amber-400 capitalize">{currentUser.subscription_tier || 'Starter'} Plan</div>
              </div>
              <button
                onClick={() => setGuidelinesModalOpen(true)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 via-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-gray-950 font-black rounded-xl text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-md shadow-amber-900/20"
                title="Upload PDF, DOCX or TXT company guidelines"
              >
                <Upload className="w-3.5 h-3.5 text-gray-950" />
                <span>Upload Guidelines</span>
              </button>
              <button
                onClick={() => handleOpenAuth('subscription', currentUser.subscription_tier)}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-750 text-white font-semibold rounded-xl text-xs border border-gray-700 transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
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
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                    Input Marketing Copy
                  </span>
                  <span className="text-[11px] text-gray-400">
                    &bull; Target Brand: <strong className="text-amber-400">{currentUser?.brand_name || currentUser?.company_name || 'Nimbus Coffee'}</strong>
                  </span>
                  <button
                    onClick={() => setGuidelinesModalOpen(true)}
                    className="text-[10px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30 transition flex items-center space-x-1 cursor-pointer"
                  >
                    <Upload className="w-2.5 h-2.5" />
                    <span>Upload Company Guidelines (PDF/DOCX)</span>
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Channel Dropdown */}
                  <div className="flex items-center space-x-1 text-xs">
                    <span className="text-gray-400">Channel:</span>
                    <select
                      value={channel}
                      onChange={(e) => setChannel(e.target.value)}
                      className="bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="press_release">Press Release</option>
                      <option value="website">Website / E-Commerce</option>
                      <option value="internal">Internal Memo</option>
                    </select>
                  </div>

                  {/* Purpose */}
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Campaign Purpose..."
                    className="bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400 w-44"
                  />
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
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/50 resize-y leading-relaxed"
                />
              </div>

              {/* Image / Metadata notice if sample 5 */}
              {imageMetadata?.is_image && (
                <div className="bg-cyan-950/20 border border-cyan-500/30 p-2.5 rounded-xl text-xs text-cyan-300 flex items-center justify-between">
                  <span>
                    Simulated Banner Graphic Attached: Contrast Ratio {imageMetadata.foreground_color} on {imageMetadata.background_color} (1.3:1) &bull; Alt text missing
                  </span>
                  <span className="text-[10px] uppercase font-bold text-cyan-400">Visual Check Active</span>
                </div>
              )}

              {/* Action Button: Check Content */}
              <div className="flex items-center justify-between pt-1">
                <div className="text-[11px] text-gray-400">
                  Runs parallel Deterministic & Grounded AI checks with PII scrubbing
                </div>

                <button
                  onClick={handleCheckContent}
                  disabled={checking}
                  className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 via-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-gray-950 font-black px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-900/30 transition transform active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
                  <span>{checking ? 'Analyzing Guidelines...' : 'Check Content with Sentinel'}</span>
                </button>
              </div>
            </div>

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
          Sentinel &bull; CodeStar 30 Round 2 MVP &bull; Team SENTINEL ARK (Jay Devgania, Dharmi Gor, Hazel Kanabar, Shiv Kumbhar)
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
    </div>
  );
}

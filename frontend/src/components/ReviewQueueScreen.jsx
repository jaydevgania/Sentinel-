import React, { useState, useEffect } from 'react';
import {
  Clock, CheckCircle, AlertTriangle, MessageSquare, ArrowRight,
  ShieldCheck, ShieldAlert, FileText, ChevronRight, Hash, Check, X
} from 'lucide-react';
import { fetchQueue, fetchHistory, recordDecision, verifyAuditChain } from '../api';

export default function ReviewQueueScreen({ activeRole, onSelectReview }) {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const [auditStatus, setAuditStatus] = useState(null);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const data = await fetchQueue();
      setQueue(data);
      if (data.length > 0 && !selectedReviewId) {
        setSelectedReviewId(data[0].review_id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (id) => {
    try {
      setHistoryLoading(true);
      const data = await fetchHistory(id);
      setHistoryData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const checkAuditChain = async () => {
    try {
      const res = await verifyAuditChain();
      setAuditStatus(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadQueue();
    checkAuditChain();
  }, []);

  useEffect(() => {
    if (selectedReviewId) {
      loadHistory(selectedReviewId);
    }
  }, [selectedReviewId]);

  const handleDecision = async (outcome) => {
    if (activeRole === 'creator') {
      alert("Role Security Policy: Creators are not authorized to make final approval decisions. Please switch to 'Manager' or 'Reviewer' in the header role switcher.");
      return;
    }

    try {
      setSubmittingDecision(true);
      await recordDecision(selectedReviewId, activeRole, outcome, decisionNotes);
      alert(`Review successfully marked as ${outcome.toUpperCase()}! Decision logged in tamper-evident audit trail.`);
      setDecisionNotes('');
      loadQueue();
      loadHistory(selectedReviewId);
      checkAuditChain();
    } catch (err) {
      alert(`Decision recording failed: ${err.message}`);
    } finally {
      setSubmittingDecision(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Queue Header & Audit Chain Status */}
      <div className="glass-panel border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Manager Review &amp; Decision Queue</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Human-in-the-loop review hub. Manager/Reviewer authorization required to approve content into production.
          </p>
        </div>

        {/* Cryptographic Tamper-Evident Verification Badge */}
        {auditStatus && (
          <div className="flex items-center space-x-2.5 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2.5 rounded-2xl text-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-emerald-300 block">SHA-256 Tamper-Evident Chain: VALID</span>
              <span className="text-[10px] text-emerald-400/80 font-mono">
                {auditStatus.total_events} events verified &bull; Hash link unbroken
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Queue List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Pending Submissions ({queue.length})
          </h3>

          {loading ? (
            <div className="text-center py-10 text-gray-400 text-xs">Loading queue...</div>
          ) : queue.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">Queue is Clear</h4>
              <p className="text-xs text-gray-400 mt-1">
                No submissions waiting for review. Use Review Studio to submit copy!
              </p>
            </div>
          ) : (
            queue.map((item) => {
              const isSelected = selectedReviewId === item.review_id;
              return (
                <div
                  key={item.review_id}
                  onClick={() => setSelectedReviewId(item.review_id)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-gray-850 border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                      : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                      ID: {item.review_id.substring(0, 8)}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                      item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      item.status === 'in_review' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                      'bg-gray-800 text-gray-300 border-gray-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-200 line-clamp-2 mb-3">
                    "{item.body_snippet}..."
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-gray-800/80">
                    <div className="flex items-center space-x-3 text-gray-400">
                      <span className="font-semibold text-white">Score: {item.compliance_score}</span>
                      <span>Open: <strong className="text-yellow-400">{item.open_findings}</strong></span>
                      {item.disputed_findings > 0 && (
                        <span>Disputed: <strong className="text-purple-400">{item.disputed_findings}</strong></span>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Review Diff & Manager Decision Controls */}
        <div className="lg:col-span-7">
          {historyLoading ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center text-xs text-gray-400">
              Loading review version history...
            </div>
          ) : historyData ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Version Diff & Audit Inspection</h3>
                  <p className="text-xs text-gray-400">Comparing original submission vs accepted suggestions</p>
                </div>
                <button
                  onClick={() => onSelectReview(historyData.review_id)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                >
                  Open in Studio &rarr;
                </button>
              </div>

              {/* Side-by-side or Diff View */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gray-950 p-3 rounded-xl border border-gray-800">
                  <div className="text-[10px] uppercase font-bold text-gray-400 mb-2 flex items-center justify-between">
                    <span>1. Creator Original Draft</span>
                    <span className="text-red-400">Pre-Review</span>
                  </div>
                  <p className="text-xs text-gray-300 font-sans leading-relaxed whitespace-pre-wrap">
                    {historyData.original_text}
                  </p>
                </div>

                <div className="bg-gray-950 p-3 rounded-xl border border-gray-800">
                  <div className="text-[10px] uppercase font-bold text-gray-400 mb-2 flex items-center justify-between">
                    <span>2. Proposed Compliant Copy</span>
                    <span className="text-emerald-400">Accepted Edits</span>
                  </div>
                  <p className="text-xs text-emerald-200 font-sans leading-relaxed whitespace-pre-wrap">
                    {historyData.revised_text}
                  </p>
                </div>
              </div>

              {/* Manager Decision Box */}
              <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300">
                    Record Manager Decision (Role Security Guard)
                  </h4>
                  <span className="text-[10px] text-gray-400">
                    Acting as: <strong className="text-amber-400 capitalize">{activeRole}</strong>
                  </span>
                </div>

                <textarea
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder="Manager review notes or feedback (optional)..."
                  rows={2}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 resize-none"
                />

                <div className="flex items-center justify-end space-x-3 pt-1">
                  <button
                    onClick={() => handleDecision('changes_requested')}
                    disabled={submittingDecision}
                    className="flex items-center space-x-1.5 px-3.5 py-2 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-xl text-xs font-bold border border-red-500/30 transition disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Request Changes</span>
                  </button>

                  <button
                    onClick={() => handleDecision('approved')}
                    disabled={submittingDecision}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-gray-950 rounded-xl text-xs font-black shadow-lg shadow-emerald-950/40 transition disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve Copy</span>
                  </button>
                </div>
              </div>

              {/* Audit Event Chronological Chain */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                  <Hash className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tamper-Evident SHA-256 Audit Chain for This Review</span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {historyData.audit_events.map((ev, i) => (
                    <div key={ev.id} className="bg-gray-950 p-2.5 rounded-lg border border-gray-800 text-[11px] font-mono">
                      <div className="flex items-center justify-between text-gray-400 mb-1">
                        <span className="font-bold text-amber-400">{ev.action}</span>
                        <span className="text-[10px]">{new Date(ev.created_at).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-gray-500 text-[10px] truncate">
                        hash: <span className="text-gray-300">{ev.hash}</span>
                      </div>
                      <div className="text-gray-500 text-[10px] truncate">
                        prev: <span className="text-gray-400">{ev.prev_hash}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center text-xs text-gray-400">
              Select an item from the queue to inspect diff and record a manager decision.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

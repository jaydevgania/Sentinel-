import React, { useState } from 'react';
import {
  CheckCircle2, AlertCircle, XCircle, HelpCircle, ArrowRight,
  ShieldAlert, ShieldCheck, Sparkles, Send, Edit3, Lock, Eye, RefreshCw
} from 'lucide-react';
import { patchFinding, submitForApproval } from '../api';

export default function FindingsStudio({
  review,
  activeRole,
  onReviewUpdated,
  onSubmitForApprovalSuccess
}) {
  const [selectedFindingId, setSelectedFindingId] = useState(
    review.findings && review.findings.length > 0 ? review.findings[0].id : null
  );
  const [editingFindingId, setEditingFindingId] = useState(null);
  const [customEditText, setCustomEditText] = useState('');
  const [submittingApproval, setSubmittingApproval] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const findings = review.findings || [];
  const bodyText = review.body_text || '';
  const score = review.compliance_score ?? 100;
  const breakdown = review.category_breakdown || {};

  // Status color helpers
  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'edited':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      case 'rejected':
        return 'bg-gray-500/15 text-gray-400 border-gray-500/30';
      case 'disputed':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      default:
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
  };

  const handleAction = async (findingId, newStatus, customEdit = null) => {
    try {
      setActionLoading(findingId);
      await patchFinding(findingId, newStatus, customEdit);
      onReviewUpdated();
    } catch (err) {
      alert(`Failed to update finding: ${err.message}`);
    } finally {
      setActionLoading(null);
      setEditingFindingId(null);
    }
  };

  const handleSubmitReview = async () => {
    try {
      setSubmittingApproval(true);
      await submitForApproval(review.id);
      onSubmitForApprovalSuccess();
    } catch (err) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setSubmittingApproval(false);
    }
  };

  // Render text with interactive spans
  const renderHighlightedText = () => {
    if (!findings.length) {
      return <div className="text-gray-300 leading-relaxed font-sans text-sm whitespace-pre-wrap">{bodyText}</div>;
    }

    // Sort findings by start position
    const sortedFindings = [...findings].sort((a, b) => a.span_start - b.span_start);
    const elements = [];
    let lastIndex = 0;

    sortedFindings.forEach((f, idx) => {
      const start = Math.max(0, Math.min(f.span_start, bodyText.length));
      const end = Math.max(start, Math.min(f.span_end, bodyText.length));

      // Append unhighlighted text before this finding
      if (start > lastIndex) {
        elements.push(
          <span key={`text-${lastIndex}`}>{bodyText.substring(lastIndex, start)}</span>
        );
      }

      const isSelected = selectedFindingId === f.id;
      const isAccepted = f.status === 'accepted';
      const isEdited = f.status === 'edited';
      const isRejected = f.status === 'rejected';

      let spanClass = 'cursor-pointer px-1 py-0.5 rounded transition font-medium border-b-2 ';
      if (isSelected) {
        spanClass += 'bg-amber-500/30 text-white border-amber-400 ring-2 ring-amber-400/40 ';
      } else if (isAccepted || isEdited) {
        spanClass += 'bg-emerald-500/20 text-emerald-300 border-emerald-400 line-through opacity-80 ';
      } else if (isRejected) {
        spanClass += 'bg-gray-800 text-gray-400 border-gray-600 opacity-60 ';
      } else {
        spanClass += f.severity === 'high'
          ? 'bg-red-500/20 text-red-300 border-red-500 '
          : 'bg-yellow-500/20 text-yellow-300 border-yellow-500 ';
      }

      elements.push(
        <mark
          key={`finding-${f.id}-${idx}`}
          onClick={() => setSelectedFindingId(f.id)}
          className={spanClass}
          title={`${f.issue} (Click to inspect)`}
        >
          {bodyText.substring(start, end)}
          {isAccepted && f.suggestion && (
            <span className="ml-1 text-xs no-underline text-emerald-400 font-bold bg-emerald-950 px-1 py-0.2 rounded border border-emerald-500/40">
              &rarr; {f.suggestion}
            </span>
          )}
          {isEdited && f.user_edit && (
            <span className="ml-1 text-xs no-underline text-cyan-400 font-bold bg-cyan-950 px-1 py-0.2 rounded border border-cyan-500/40">
              &rarr; {f.user_edit}
            </span>
          )}
        </mark>
      );

      lastIndex = Math.max(lastIndex, end);
    });

    if (lastIndex < bodyText.length) {
      elements.push(
        <span key={`text-end`}>{bodyText.substring(lastIndex)}</span>
      );
    }

    return (
      <div className="text-gray-200 leading-relaxed font-sans text-sm whitespace-pre-wrap">
        {elements}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Compliance Score & AI Disclosure */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Score & Gauge */}
        <div className="flex items-center space-x-5 w-full md:w-auto">
          <div className="relative w-18 h-18 flex items-center justify-center shrink-0">
            <svg className="w-18 h-18 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={score >= 85 ? 'text-emerald-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500'}
                strokeDasharray={`${score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-xl font-black text-white">{score}</span>
              <span className="text-[10px] text-gray-400 block -mt-1">/100</span>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">Brand Compliance Score</h2>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                score >= 85 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                score >= 60 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                'bg-red-500/10 text-red-400 border-red-500/30'
              }`}>
                {breakdown.grade || 'Score'} ({breakdown.status || 'Active'})
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {findings.length} findings detected &bull; {findings.filter(f => f.status === 'open').length} require human decision
            </p>
          </div>
        </div>

        {/* AI & Service Disclosure Label (Section 7 Tier 1 requirement) */}
        <div className="bg-gray-950/70 border border-gray-800 rounded-xl p-3 w-full md:max-w-md text-xs">
          <div className="flex items-center space-x-2 text-amber-400 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Disclosure & Privacy Trace</span>
          </div>
          <p className="text-gray-300 text-[11px] leading-relaxed">
            {review.ai_disclosure || 'Processed with Grounded Review Engine.'}
          </p>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Content with Highlighted Spans */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Content Studio</span>
                <span className="text-[11px] text-gray-500">&bull; {review.channel}</span>
                <span className="text-[11px] text-gray-500">&bull; {review.purpose}</span>
              </div>
              <span className="text-[11px] text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Click highlight to jump to card
              </span>
            </div>

            <div className="p-4 bg-gray-950/80 rounded-xl border border-gray-800/80 min-h-[220px]">
              {renderHighlightedText()}
            </div>

            {/* Action Bar for Creator */}
            <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
              <div className="text-xs text-gray-400">
                Review Status: <span className="font-semibold text-amber-400 uppercase">{review.status}</span>
              </div>

              {review.status !== 'approved' && review.status !== 'in_review' ? (
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingApproval}
                  className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-amber-900/20 transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingApproval ? 'Submitting...' : 'Submit for Manager Approval'}</span>
                </button>
              ) : (
                <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{review.status === 'approved' ? 'Approved by Manager' : 'Submitted & Waiting in Queue'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Findings Cards & Grounding Trace */}
        <div className="lg:col-span-5 space-y-3 max-h-[640px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Findings ({findings.length})
            </h3>
            <span className="text-[11px] text-gray-500">Human Decision Required</span>
          </div>

          {findings.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">Zero Compliance Issues Found!</h4>
              <p className="text-xs text-gray-400 mt-1">
                This copy fully complies with Nimbus Coffee tone, terminology, facts, and accessibility guidelines.
              </p>
            </div>
          ) : (
            findings.map((f) => {
              const isSelected = selectedFindingId === f.id;
              const isEditing = editingFindingId === f.id;
              const isLoading = actionLoading === f.id;

              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedFindingId(f.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-gray-850 border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                      : 'bg-gray-900/90 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  {/* Card Header: Type, Severity, Status */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getSeverityBadge(f.severity)}`}>
                        {f.severity}
                      </span>
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {f.type}
                      </span>
                    </div>

                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border capitalize ${getStatusBadge(f.status)}`}>
                      {f.status}
                    </span>
                  </div>

                  {/* Issue Title */}
                  <h4 className="text-sm font-bold text-gray-100 mb-1">
                    {f.issue}
                  </h4>

                  {/* Plain Language Explanation */}
                  <p className="text-xs text-gray-300 leading-relaxed mb-3">
                    {f.explanation}
                  </p>

                  {/* Mandatory Citation Trace (Section 2.4 & Section 7 Tier 1 requirement) */}
                  <div className="bg-gray-950/70 border border-gray-800 rounded-lg p-2.5 mb-3 text-[11px]">
                    <div className="flex items-center space-x-1.5 text-gray-400 mb-1">
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span className="font-semibold text-gray-300">Cited Source:</span>
                      <span className="text-amber-400 font-mono text-[10px]">[{f.source_type}:{f.source_id}]</span>
                    </div>
                    {f.source_preview && (
                      <p className="text-gray-400 italic text-[11px] line-clamp-2">
                        "{f.source_preview}"
                      </p>
                    )}
                  </div>

                  {/* Suggested Fix & Intent Guard */}
                  {f.suggestion && (
                    <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-2.5 mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Suggested Minimal Edit
                        </span>
                        <span className="text-[10px] text-emerald-500/80">Intent Guard Verified &check;</span>
                      </div>
                      <p className="text-xs font-medium text-emerald-200">
                        {f.suggestion}
                      </p>
                    </div>
                  )}

                  {/* Creator Action Buttons (Accept, Edit, Reject, Dispute) */}
                  {isEditing ? (
                    <div className="mt-3 pt-3 border-t border-gray-800 space-y-2">
                      <input
                        type="text"
                        value={customEditText}
                        onChange={(e) => setCustomEditText(e.target.value)}
                        placeholder="Enter your revised wording..."
                        className="w-full bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingFindingId(null);
                          }}
                          className="px-2.5 py-1 text-xs text-gray-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(f.id, 'edited', customEditText);
                          }}
                          className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold"
                        >
                          Apply Edit
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-gray-800/80 flex items-center justify-between gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(f.id, 'accepted');
                        }}
                        disabled={isLoading}
                        className="flex-1 py-1.5 px-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-[11px] font-bold border border-emerald-500/30 transition text-center"
                      >
                        Accept Fix
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingFindingId(f.id);
                          setCustomEditText(f.suggestion || '');
                        }}
                        disabled={isLoading}
                        className="flex-1 py-1.5 px-2 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white rounded-lg text-[11px] font-bold border border-cyan-500/30 transition text-center"
                      >
                        Custom Edit
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(f.id, 'rejected');
                        }}
                        disabled={isLoading}
                        className="py-1.5 px-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-[11px] font-semibold transition text-center"
                      >
                        Reject
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(f.id, 'disputed');
                        }}
                        disabled={isLoading}
                        title="Dispute rule: informs guideline-gap detector"
                        className="py-1.5 px-2 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white rounded-lg text-[11px] font-semibold border border-purple-500/30 transition text-center"
                      >
                        Dispute
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

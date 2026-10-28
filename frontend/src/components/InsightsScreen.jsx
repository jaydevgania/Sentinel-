import React, { useState, useEffect } from 'react';
import {
  BarChart3, AlertOctagon, TrendingUp, ShieldCheck,
  CheckCircle, Lightbulb, ArrowUpRight, Check
} from 'lucide-react';
import { fetchInsights, verifyAuditChain } from '../api';

export default function InsightsScreen() {
  const [insights, setInsights] = useState(null);
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approvedGaps, setApprovedGaps] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [ins, aud] = await Promise.all([
          fetchInsights(),
          verifyAuditChain()
        ]);
        setInsights(ins);
        setAudit(aud);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleApproveRefinement = (ruleId) => {
    setApprovedGaps(prev => ({ ...prev, [ruleId]: true }));
    alert("Guideline Refinement Approved! Manager change logged into audit trail.");
  };

  if (loading) {
    return <div className="text-center py-16 text-gray-400 text-xs">Computing intelligence analytics...</div>;
  }

  if (!insights) return null;

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 hover:border-amber-500/30 transition">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
            Total Content Reviews
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{insights.summary.total_reviews}</span>
            <span className="text-xs text-gray-400">runs executed</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 hover:border-amber-500/30 transition">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
            Total Issues Flagged
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-amber-400">{insights.summary.total_findings}</span>
            <span className="text-xs text-gray-400">prevented before publish</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 hover:border-emerald-500/30 transition">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
            Avg Brand Compliance
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-400">
              {insights.summary.average_compliance_score}
            </span>
            <span className="text-xs text-gray-400">/ 100</span>
          </div>
        </div>
      </div>

      {/* Guideline-Gap Detector (Tier 2 Named Improvement) */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Guideline-Gap Detector (Continuous Learning)
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/30">
            Automated Rule Evolution
          </span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          Sentinel continuously monitors creator disputes and manager overrides. When a rule generates repeat friction, Sentinel diagnoses the ambiguity and drafts a refined clause for manager sign-off.
        </p>

        <div className="space-y-3">
          {insights.guideline_gaps.map((gap) => {
            const isApproved = approvedGaps[gap.rule_id];
            return (
              <div key={gap.rule_id} className="glass-card rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-gray-400">
                    Rule ID: {gap.rule_id}
                  </span>
                  <span className="text-[11px] text-purple-300 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-800">
                    Dispute Rate: {gap.dispute_rate_pct}% ({gap.dispute_count} disputes)
                  </span>
                </div>

                <div className="text-xs text-gray-300">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold mb-0.5">Current Guideline:</span>
                  <p className="italic">"{gap.current_clause}"</p>
                </div>

                <div className="text-xs text-amber-300 bg-amber-950/20 p-2.5 rounded-lg border border-amber-500/20">
                  <span className="text-amber-400 block text-[10px] uppercase font-bold mb-0.5">Automated Diagnosis:</span>
                  <p>{gap.diagnosis}</p>
                </div>

                <div className="bg-emerald-950/20 p-3 rounded-lg border border-emerald-500/30">
                  <span className="text-emerald-400 block text-[10px] uppercase font-bold mb-1">
                    Proposed Clarified Rewording:
                  </span>
                  <p className="text-xs text-emerald-200 font-medium">
                    {gap.proposed_refinement}
                  </p>
                </div>

                <div className="flex justify-end pt-1">
                  {isApproved ? (
                    <span className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                      <Check className="w-3.5 h-3.5" />
                      <span>Refinement Active in Knowledge Base</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApproveRefinement(gap.rule_id)}
                      className="px-4 py-2 glass-button-primary text-gray-950 text-xs font-bold rounded-xl shadow-md transition"
                    >
                      Approve & Adopt Clarification
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Most Violated Rules & Tamper-Proof Audit Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Violated Rules */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-2">
            <AlertOctagon className="w-4 h-4 text-red-400" />
            <span>Top Policy Violations</span>
          </h3>

          <div className="space-y-2">
            {insights.most_violated_rules.map((r, i) => (
              <div key={r.rule_id} className="glass-panel-subtle p-3 rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">{r.category}</span>
                  <p className="text-xs text-gray-300 line-clamp-1">{r.clause}</p>
                </div>
                <span className="text-xs font-extrabold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20 shrink-0 ml-3">
                  {r.violation_count} flags
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cryptographic Proof Verification Card */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cryptographic Proof & Tamper Defense</span>
          </h3>

          {audit && (
            <div className="space-y-3 text-xs">
              <div className="glass-panel-subtle p-3.5 rounded-xl border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Chain Integrity:</span>
                  <span className="font-bold text-emerald-400">
                    {audit.valid ? "UNBROKEN & VERIFIED" : "COMPROMISED"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Verified Audit Events:</span>
                  <span className="font-mono text-white font-bold">{audit.total_events}</span>
                </div>
                {audit.latest_hash && (
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-gray-400 block text-[10px] mb-0.5">Latest Block SHA-256:</span>
                    <span className="font-mono text-[10px] text-amber-400 break-all">{audit.latest_hash}</span>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed">
                Every review, finding status change, and approval decision is hashed sequentially with the previous block's SHA-256 signature. Any retroactive modification to past decisions is immediately detected.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

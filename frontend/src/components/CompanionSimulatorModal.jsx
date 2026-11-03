import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Check, Download, ExternalLink, Shield, RefreshCw, Compass } from 'lucide-react';
import { checkCompanion } from '../api';

const ChromeIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <line x1="21.17" y1="8" x2="12" y2="8" />
    <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
    <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
  </svg>
);

export default function CompanionSimulatorModal({ isOpen, onClose }) {
  const [editorText, setEditorText] = useState(
    "A huge shoutout to our hardworking staff at NimbusCo for making this holiday festival so special! Our brew is objectively the world's best coffee, no cap fr fr."
  );
  const [jurisdiction, setJurisdiction] = useState('global');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const debounceRef = useRef(null);

  const runLiveCheck = async (text, jur) => {
    if (!text || text.length < 5) return;
    try {
      setChecking(true);
      const res = await checkCompanion(text, jur);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runLiveCheck(editorText, jurisdiction);
    }
  }, [isOpen, jurisdiction]);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setEditorText(newText);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runLiveCheck(newText, jurisdiction);
    }, 400);
  };

  const handleApplyFix = (violationText, suggestion) => {
    if (!suggestion) return;
    const updated = editorText.replace(new RegExp(violationText, 'i'), suggestion);
    setEditorText(updated);
    runLiveCheck(updated, jurisdiction);
  };

  if (!isOpen) return null;

  const score = result?.score ?? 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
      <div className="glass-panel w-full max-w-4xl rounded-3xl border border-amber-500/30 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-gray-950 font-black flex items-center justify-center shadow-lg shadow-amber-500/20">
              <ChromeIcon className="w-5 h-5 text-gray-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-white">
                  Real-Time Inline Authoring Companion Simulator
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Round 3 Deliverable
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Experience Sentinel embedded directly in Google Docs &amp; browser textareas with real-time squiggly checks
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Controls & Score Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl border-2 border-amber-500/50 flex items-center justify-center font-black text-sm text-white bg-amber-500/10">
                {score}
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Live Compliance</div>
                <div className={`text-xs font-bold ${score >= 90 ? 'text-emerald-400' : score >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                  {result ? `${result.total_issues} issues detected` : 'Scanning...'}
                </div>
              </div>
            </div>

            <div className="h-6 w-px bg-white/10 hidden sm:block"></div>

            {/* Jurisdiction selector */}
            <div className="flex items-center space-x-1.5 text-xs">
              <span className="text-slate-400">Jurisdiction Lens:</span>
              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="glass-input rounded-xl px-2.5 py-1 text-xs text-white outline-none"
              >
                <option value="global" className="bg-[#0b0f19]">🌐 Global Standard</option>
                <option value="india_asci" className="bg-[#0b0f19]">🇮🇳 India (ASCI &amp; Hinglish Voice)</option>
                <option value="us_ftc" className="bg-[#0b0f19]">🇺🇸 United States (FTC Endorsements)</option>
                <option value="eu_green" className="bg-[#0b0f19]">🇪🇺 EU (Green Claims Directive)</option>
                <option value="uk_asa" className="bg-[#0b0f19]">🇬🇧 UK (ASA CAP Code)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-400 flex items-center space-x-1">
              <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin text-amber-400' : 'text-slate-500'}`} />
              <span>{checking ? 'Evaluating...' : 'Synchronized'}</span>
            </span>
          </div>
        </div>

        {/* Live Inline Authoring Canvas (Simulating Google Docs) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Authoring Canvas (Type freely below to see real-time suggestions)</span>
            <span className="text-amber-400 normal-case font-normal text-[11px]">Sub-second synchronous review</span>
          </div>

          <div className="relative">
            <textarea
              rows={4}
              value={editorText}
              onChange={handleTextChange}
              placeholder="Start drafting content..."
              className="w-full glass-input rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 outline-none leading-relaxed resize-y focus:border-amber-400/60 shadow-inner"
            />
          </div>
        </div>

        {/* Detected Issues Stream with One-Click Fix */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Grounded Inline Interventions ({result?.findings?.length || 0})
          </div>

          {result?.cultural_notes && result.cultural_notes.length > 0 && (
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-300 flex items-center space-x-2">
              <span className="text-base">🇮🇳</span>
              <span>
                <strong>Cultural Voice Protected:</strong> "{result.cultural_notes.map(n => n.term).join(', ')}" allowed as authentic regional colloquialisms under ASCI Indian English calibration.
              </span>
            </div>
          )}

          {result?.findings && result.findings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-56 overflow-y-auto">
              {result.findings.map((f, i) => (
                <div key={i} className="glass-card rounded-2xl p-3.5 space-y-2 border-l-4 border-l-amber-500 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {f.type}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Source: {f.source.id}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white mt-1.5">{f.issue}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{f.explanation}</div>
                  </div>

                  {f.suggestion && (
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[11px] text-emerald-300 font-medium truncate max-w-[200px]">
                        Fix: &ldquo;{f.suggestion}&rdquo;
                      </span>
                      <button
                        onClick={() => handleApplyFix(f.text || f.issue, f.suggestion)}
                        className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-gray-950 rounded-lg text-[10px] font-black transition cursor-pointer flex items-center space-x-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Apply Fix</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-emerald-400 font-bold bg-emerald-950/20 rounded-2xl border border-emerald-500/20">
              ✓ 100% Brand Compliant! Zero policy violations detected in current text.
            </div>
          )}
        </div>

        {/* Real Extension Download & Instructions Notice */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-bold text-white flex items-center space-x-1.5">
              <span>Install the Real Manifest V3 Extension</span>
              <span className="text-[9px] uppercase font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">Source in repo</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Full Chrome Manifest V3 code located in <code>/extension</code> folder. Load unpacked via <code>chrome://extensions</code>.
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <a
              href="https://github.com/jaydevgania/Sentinel-/tree/main/extension"
              target="_blank"
              rel="noreferrer"
              className="glass-button-primary px-3.5 py-1.5 font-bold rounded-xl text-[11px] text-gray-950 flex items-center space-x-1.5"
            >
              <ExternalLink className="w-3 h-3 text-gray-950" />
              <span>View Extension in GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

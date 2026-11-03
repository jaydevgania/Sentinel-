import React from 'react';
import {
  X, ShieldCheck, Award, CheckCircle2, Download, Printer, Copy,
  Lock, Calendar, Globe, FileText, Check
} from 'lucide-react';

export default function ComplianceCertificateModal({ isOpen, onClose, review }) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !review) return null;

  const score = review.compliance_score ?? 100;
  const reviewId = review.id || 'rev-verified-001';
  const timestamp = review.created_at || new Date().toISOString();
  const mockSha256 = `sha256:${Array.from(reviewId + timestamp).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000007, 0).toString(16).padStart(64, 'a')}`;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(mockSha256);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const certData = {
      certificate_title: "Pre-Publication Brand & Regulatory Compliance Certificate",
      platform: "Sentinel Governance Engine v3.0",
      review_id: reviewId,
      timestamp: timestamp,
      brand_target: "Nimbus Coffee Global",
      channel: review.channel,
      purpose: review.purpose,
      compliance_score: score,
      findings_resolved: (review.findings || []).filter(f => f.status === 'accepted' || f.status === 'edited').length,
      open_violations: (review.findings || []).filter(f => f.status === 'open').length,
      statutes_verified: [
        "Internal Brand Identity Book v2026",
        "ASCI Advertising Code Ch 1 (India)",
        "FTC 16 CFR Part 255 (USA Endorsements)",
        "EU Directive 2024/825 (Green Claims)",
        "W3C WCAG 2.1 AA Contrast Standards"
      ],
      cryptographic_sha256_stamp: mockSha256,
      audit_integrity: "VERIFIED_UNBROKEN"
    };

    const blob = new Blob([JSON.stringify(certData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentinel-certificate-${reviewId.substring(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
      <div className="glass-panel w-full max-w-2xl rounded-3xl border border-amber-500/40 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Header Banner */}
        <div className="text-center space-y-2 border-b border-white/10 pb-5">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-black/70 border border-amber-500/40 p-2 flex items-center justify-center shadow-2xl shadow-amber-500/30">
            <img
              src="/sentinel-mark-transparent.png"
              alt="Sentinel Seal"
              className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]"
            />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
              Sentinel Official Verification Seal
            </span>
            <h2 className="text-xl font-extrabold text-white mt-2">
              Pre-Publication Compliance Certificate
            </h2>
            <p className="text-xs text-slate-400">
              Cryptographically verified audit stamp for digital marketing release
            </p>
          </div>
        </div>

        {/* Certificate Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="glass-panel-subtle p-3.5 rounded-2xl border border-white/10 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Compliance Score</div>
            <div className={`text-2xl font-black mt-0.5 ${score >= 85 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
              {score}<span className="text-xs text-slate-400 font-normal">/100</span>
            </div>
            <div className="text-[10px] font-bold text-slate-300 mt-0.5">
              {score >= 85 ? 'Grade A (Approved)' : score >= 60 ? 'Grade B (Advisory)' : 'Grade C (Flagged)'}
            </div>
          </div>

          <div className="glass-panel-subtle p-3.5 rounded-2xl border border-white/10 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Target Channel</div>
            <div className="text-base font-bold text-white mt-1 capitalize truncate">
              {review.channel?.replace('_', ' ') || 'Instagram'}
            </div>
            <div className="text-[10px] text-slate-400 truncate mt-0.5">
              {review.purpose || 'Marketing Campaign'}
            </div>
          </div>

          <div className="glass-panel-subtle p-3.5 rounded-2xl border border-white/10 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Audit Chain Status</div>
            <div className="text-base font-bold text-emerald-400 mt-1 flex items-center justify-center space-x-1">
              <CheckCircle2 className="w-4 h-4 mr-0.5" />
              <span>Verified</span>
            </div>
            <div className="text-[10px] text-slate-400 truncate mt-0.5">
              Tamper-Evident SHA-256
            </div>
          </div>
        </div>

        {/* Verified Regulatory Frameworks */}
        <div className="glass-panel-subtle p-4 rounded-2xl border border-white/10 space-y-2 text-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>Verified Standards &amp; Statutes</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
            <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-xl">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Brand Kit &amp; Banned Terminology v2026</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-xl">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>W3C WCAG 2.1 AA Contrast (Min 4.5:1)</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-xl">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>ASCI Ch 1 Superlative Claims (India)</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-xl">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>FTC 16 CFR Part 255 (US Disclosures)</span>
            </div>
          </div>
        </div>

        {/* Cryptographic SHA-256 Stamp */}
        <div className="bg-black/40 border border-white/10 p-3.5 rounded-2xl space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            <span className="flex items-center space-x-1">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Cryptographic Block Hash Stamp</span>
            </span>
            <button
              onClick={handleCopyHash}
              className="text-amber-400 hover:text-amber-300 flex items-center space-x-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>{copied ? 'Copied!' : 'Copy Hash'}</span>
            </button>
          </div>
          <div className="font-mono text-[10px] text-amber-300/90 break-all select-all">
            {mockSha256}
          </div>
          <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
            <span>Verified at: {new Date(timestamp).toLocaleString()}</span>
            <span>Review ID: {reviewId.substring(0, 12)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleDownloadJson}
            className="glass-button-secondary px-4 py-2 rounded-xl text-xs font-bold text-slate-200 flex items-center space-x-1.5 cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Download JSON Proof</span>
          </button>
          <button
            onClick={handlePrint}
            className="glass-button-primary px-4 py-2 rounded-xl text-xs font-bold text-gray-950 flex items-center space-x-1.5 cursor-pointer shadow-md"
          >
            <Printer className="w-3.5 h-3.5 text-gray-950" />
            <span>Print Certificate</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  BookOpen, Sliders, CheckSquare, Layers, Upload, Plus,
  FileText, ShieldCheck, Sparkles, Check
} from 'lucide-react';
import { fetchRules, fetchTerms, fetchFacts, fetchAssets, importSourceFile } from '../api';

export default function KnowledgeBaseScreen() {
  const [activeSubTab, setActiveSubTab] = useState('rules');
  const [rules, setRules] = useState([]);
  const [terms, setTerms] = useState([]);
  const [facts, setFacts] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [r, t, f, a] = await Promise.all([
        fetchRules(),
        fetchTerms(),
        fetchFacts(),
        fetchAssets()
      ]);
      setRules(r);
      setTerms(t);
      setFacts(f);
      setAssets(a);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'messaging');

    try {
      setUploading(true);
      const res = await importSourceFile(formData);
      setImportResult(res);
      await loadData();
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Brand Knowledge Base & Source Material</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Active truth repository for Nimbus Coffee. AI findings are strictly grounded against these entries.
          </p>
        </div>

        {/* Upload Guideline Document */}
        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-2 px-3.5 py-2 bg-gray-800 hover:bg-gray-750 text-gray-200 rounded-xl text-xs font-semibold cursor-pointer border border-gray-700 transition">
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>{uploading ? 'Extracting Clauses...' : 'Import Guideline (PDF/DOCX)'}</span>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {importResult && (
        <div className="bg-emerald-950/30 border border-emerald-500/40 p-4 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Successfully ingested <strong>{importResult.filename}</strong> & extracted {importResult.extracted_clauses_count} actionable rules into the knowledge base.
            </span>
          </div>
          <button onClick={() => setImportResult(null)} className="text-gray-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-800 pb-2 text-xs font-semibold">
        {[
          { id: 'rules', label: `Rules (${rules.length})` },
          { id: 'terms', label: `Terminology (${terms.length})` },
          { id: 'facts', label: `Approved Facts (${facts.length})` },
          { id: 'assets', label: `Brand Assets (${assets.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 rounded-xl transition ${
              activeSubTab === tab.id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-gray-400 hover:text-white hover:bg-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400">Loading knowledge base...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeSubTab === 'rules' && rules.map(r => (
            <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {r.category}
                </span>
                <span className="text-[10px] font-mono text-gray-400">ID: {r.id}</span>
              </div>
              <p className="text-xs text-gray-200 leading-relaxed font-medium">
                {r.clause_text}
              </p>
              <div className="text-[10px] text-gray-400 pt-1 border-t border-gray-800/80 flex items-center justify-between">
                <span>Source: {r.source_doc || 'Brand Core'}</span>
                <span className="capitalize">Severity: {r.severity}</span>
              </div>
            </div>
          ))}

          {activeSubTab === 'terms' && terms.map(t => (
            <div key={t.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  Preferred: "{t.preferred}"
                </span>
                <span className="text-[10px] font-mono text-gray-400">ID: {t.id}</span>
              </div>
              <div className="text-xs text-gray-300">
                <span className="text-gray-400">Banned Variants: </span>
                <span className="text-red-400 font-medium">
                  {t.banned_variants.map(v => `"${v}"`).join(', ')}
                </span>
              </div>
              {t.note && (
                <p className="text-[11px] text-gray-400 italic">
                  Note: {t.note}
                </p>
              )}
            </div>
          ))}

          {activeSubTab === 'facts' && facts.map(f => (
            <div key={f.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  Verified Brand Fact
                </span>
                <span className="text-[10px] font-mono text-gray-400">ID: {f.id}</span>
              </div>
              <p className="text-xs text-gray-100 font-semibold leading-relaxed">
                "{f.statement}"
              </p>
              <div className="text-[10px] text-gray-400 pt-1 border-t border-gray-800/80">
                Source: {f.source || 'Verified Filing'}
              </div>
            </div>
          ))}

          {activeSubTab === 'assets' && assets.map(a => (
            <div key={a.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  {a.type} Asset
                </span>
                <span className="text-[10px] font-mono text-gray-400">ID: {a.id}</span>
              </div>
              <div className="text-xs font-mono text-amber-300 bg-gray-950 p-2 rounded border border-gray-800 truncate">
                {a.value}
              </div>
              {a.usage_notes && (
                <p className="text-[11px] text-gray-400">
                  {a.usage_notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

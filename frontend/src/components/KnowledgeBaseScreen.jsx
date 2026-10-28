import React, { useState, useEffect } from 'react';
import {
  BookOpen, Sliders, CheckSquare, Layers, Upload, Plus,
  FileText, ShieldCheck, Sparkles, Check, Trash2, Building,
  HelpCircle, ChevronRight, AlertCircle, X
} from 'lucide-react';
import {
  fetchRules, createRule, deleteRule,
  fetchTerms, createTerm, deleteTerm,
  fetchFacts, createFact, deleteFact,
  fetchAssets, importSourceFile
} from '../api';

export default function KnowledgeBaseScreen({ currentUser, onOpenUploadModal }) {
  const [activeSubTab, setActiveSubTab] = useState('rules');
  const [selectedWorkspaceMode, setSelectedWorkspaceMode] = useState(
    currentUser?.workspace_id ? 'custom' : 'demo'
  );

  const [rules, setRules] = useState([]);
  const [terms, setTerms] = useState([]);
  const [facts, setFacts] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Quick Direct Upload
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Manual Add Modal State
  const [addModalType, setAddModalType] = useState(null); // 'rule', 'term', 'fact'
  const [newRuleData, setNewRuleData] = useState({ category: 'messaging', clause_text: '', severity: 'medium', source_doc: '' });
  const [newTermData, setNewTermData] = useState({ preferred: '', banned_variants: '', note: '' });
  const [newFactData, setNewFactData] = useState({ statement: '', source: '' });

  const activeWsId = selectedWorkspaceMode === 'custom' && currentUser?.workspace_id
    ? currentUser.workspace_id
    : 'ws-nimbus-demo-001';

  const brandDisplayName = selectedWorkspaceMode === 'custom' && currentUser
    ? (currentUser.brand_name || currentUser.company_name || 'My Company')
    : 'Nimbus Coffee';

  const loadData = async () => {
    try {
      setLoading(true);
      const [r, t, f, a] = await Promise.all([
        fetchRules(activeWsId),
        fetchTerms(activeWsId),
        fetchFacts(activeWsId),
        fetchAssets(activeWsId)
      ]);
      setRules(r || []);
      setTerms(t || []);
      setFacts(f || []);
      setAssets(a || []);
    } catch (err) {
      console.error('Failed to load knowledge base:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedWorkspaceMode, currentUser]);

  const handleQuickFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('workspace_id', activeWsId);
    formData.append('brand_name', brandDisplayName);
    formData.append('category', 'general');

    try {
      setUploading(true);
      const res = await importSourceFile(formData);
      setImportResult(res);
      await loadData();
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    if (!newRuleData.clause_text.trim()) return;

    try {
      setActionLoading(true);
      await createRule({
        workspace_id: activeWsId,
        category: newRuleData.category,
        clause_text: newRuleData.clause_text.trim(),
        severity: newRuleData.severity,
        source_doc: newRuleData.source_doc.trim() || `${brandDisplayName} Guidelines`
      });
      setNewRuleData({ category: 'messaging', clause_text: '', severity: 'medium', source_doc: '' });
      setAddModalType(null);
      await loadData();
    } catch (err) {
      alert(`Failed to add rule: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRule = async (id) => {
    if (!confirm('Are you sure you want to delete this guideline rule?')) return;
    try {
      await deleteRule(id);
      setRules(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleCreateTerm = async (e) => {
    e.preventDefault();
    if (!newTermData.preferred.trim()) return;

    const bannedList = newTermData.banned_variants
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    try {
      setActionLoading(true);
      await createTerm({
        workspace_id: activeWsId,
        preferred: newTermData.preferred.trim(),
        banned_variants: bannedList,
        note: newTermData.note.trim() || null
      });
      setNewTermData({ preferred: '', banned_variants: '', note: '' });
      setAddModalType(null);
      await loadData();
    } catch (err) {
      alert(`Failed to add term: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTerm = async (id) => {
    if (!confirm('Are you sure you want to delete this terminology entry?')) return;
    try {
      await deleteTerm(id);
      setTerms(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleCreateFact = async (e) => {
    e.preventDefault();
    if (!newFactData.statement.trim()) return;

    try {
      setActionLoading(true);
      await createFact({
        workspace_id: activeWsId,
        statement: newFactData.statement.trim(),
        source: newFactData.source.trim() || `${brandDisplayName} Fact Sheet`
      });
      setNewFactData({ statement: '', source: '' });
      setAddModalType(null);
      await loadData();
    } catch (err) {
      alert(`Failed to add fact: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFact = async (id) => {
    if (!confirm('Are you sure you want to delete this brand fact?')) return;
    try {
      await deleteFact(id);
      setFacts(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace & Guidelines Context Header */}
      <div className="glass-panel rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-amber-400 shrink-0" />
            <h2 className="text-lg font-black text-white flex items-center space-x-2">
              <span>{brandDisplayName} Guidelines & Truth Repository</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {selectedWorkspaceMode === 'custom' ? 'Company Isolated' : 'Demo Workspace'}
              </span>
            </h2>
          </div>
          <p className="text-xs text-gray-400">
            All AI compliance checks and deterministic rules are strictly evaluated against this knowledge base.
          </p>
        </div>

        {/* Action Controls & Upload Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {currentUser && (
            <div className="flex items-center glass-card p-1 rounded-xl text-xs">
              <button
                onClick={() => setSelectedWorkspaceMode('custom')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  selectedWorkspaceMode === 'custom'
                    ? 'bg-amber-500 text-gray-950 shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {currentUser.brand_name || 'My Brand'}
              </button>
              <button
                onClick={() => setSelectedWorkspaceMode('demo')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  selectedWorkspaceMode === 'demo'
                    ? 'bg-amber-500 text-gray-950 shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Nimbus Demo
              </button>
            </div>
          )}

          {/* Dedicated Upload Modal Launcher */}
          <button
            onClick={() => onOpenUploadModal ? onOpenUploadModal() : null}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 via-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-gray-950 font-black rounded-xl text-xs shadow-md shadow-amber-900/20 transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-gray-950" />
            <span>Upload Company Guidelines</span>
          </button>

          {/* Quick inline file picker */}
          <label className="flex items-center space-x-1.5 px-3 py-2 glass-card hover:border-amber-500/40 text-gray-300 rounded-xl text-xs font-semibold cursor-pointer transition">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>{uploading ? 'Extracting...' : 'Quick Import (PDF/DOCX)'}</span>
            <input
              type="file"
              accept=".pdf,.docx,.txt,.md"
              onChange={handleQuickFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Success Notification after Document Ingestion */}
      {importResult && (
        <div className="bg-emerald-950/30 border border-emerald-500/40 p-4 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Successfully parsed <strong>{importResult.filename}</strong> & saved {importResult.extracted_clauses_count} brand clauses to <strong>{importResult.brand_name}</strong>.
            </span>
          </div>
          <button onClick={() => setImportResult(null)} className="text-gray-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Tabs & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex space-x-2 text-xs font-semibold overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'rules', label: `Rules & Clauses (${rules.length})` },
            { id: 'terms', label: `Terminology & Words (${terms.length})` },
            { id: 'facts', label: `Verified Facts (${facts.length})` },
            { id: 'assets', label: `Brand Assets (${assets.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl transition whitespace-nowrap ${
                activeSubTab === tab.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Add Entry Action Button */}
        <div>
          {activeSubTab === 'rules' && (
            <button
              onClick={() => setAddModalType('rule')}
              className="flex items-center space-x-1.5 px-3 py-1.5 glass-card hover:border-amber-500/50 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Add Custom Rule</span>
            </button>
          )}
          {activeSubTab === 'terms' && (
            <button
              onClick={() => setAddModalType('term')}
              className="flex items-center space-x-1.5 px-3 py-1.5 glass-card hover:border-emerald-500/50 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Add Banned / Preferred Term</span>
            </button>
          )}
          {activeSubTab === 'facts' && (
            <button
              onClick={() => setAddModalType('fact')}
              className="flex items-center space-x-1.5 px-3 py-1.5 glass-card hover:border-cyan-500/50 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Add Brand Fact</span>
            </button>
          )}
        </div>
      </div>

      {/* SUB-MODAL 1: ADD RULE */}
      {addModalType === 'rule' && (
        <div className="glass-panel border-amber-500/40 rounded-2xl p-5 shadow-2xl animate-in fade-in space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Add Guideline Rule for {brandDisplayName}</span>
            </h4>
            <button onClick={() => setAddModalType(null)} className="text-gray-400 hover:text-white">✕</button>
          </div>
          <form onSubmit={handleCreateRule} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Clause Text / Policy Directive</label>
              <textarea
                value={newRuleData.clause_text}
                onChange={(e) => setNewRuleData({ ...newRuleData, clause_text: e.target.value })}
                placeholder="e.g. Never use internet slang in official press releases or customer statements."
                rows={2}
                className="w-full glass-input rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Category</label>
                <select
                  value={newRuleData.category}
                  onChange={(e) => setNewRuleData({ ...newRuleData, category: e.target.value })}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="messaging">Messaging / Claims</option>
                  <option value="tone">Tone of Voice</option>
                  <option value="terminology">Terminology</option>
                  <option value="visual">Visual & Assets</option>
                  <option value="accessibility">Accessibility</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Severity</label>
                <select
                  value={newRuleData.severity}
                  onChange={(e) => setNewRuleData({ ...newRuleData, severity: e.target.value })}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="high">High (Strict Blocker)</option>
                  <option value="medium">Medium (Standard Rule)</option>
                  <option value="low">Low (Guidance / Advisory)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Source Reference</label>
                <input
                  type="text"
                  value={newRuleData.source_doc}
                  onChange={(e) => setNewRuleData({ ...newRuleData, source_doc: e.target.value })}
                  placeholder="e.g. Brand Handbook 2026"
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setAddModalType(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 glass-button-primary font-bold rounded-xl text-xs transition disabled:opacity-50"
              >
                {actionLoading ? 'Saving...' : 'Save Rule'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-MODAL 2: ADD TERM */}
      {addModalType === 'term' && (
        <div className="glass-panel border-emerald-500/40 rounded-2xl p-5 shadow-2xl animate-in fade-in space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Add Terminology Rule for {brandDisplayName}</span>
            </h4>
            <button onClick={() => setAddModalType(null)} className="text-gray-400 hover:text-white">✕</button>
          </div>
          <form onSubmit={handleCreateTerm} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-emerald-400 uppercase mb-1">Preferred Term (What to use)</label>
                <input
                  type="text"
                  value={newTermData.preferred}
                  onChange={(e) => setNewTermData({ ...newTermData, preferred: e.target.value })}
                  placeholder="e.g. team members, cold brew"
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-red-400 uppercase mb-1">Banned Variants (Comma-separated)</label>
                <input
                  type="text"
                  value={newTermData.banned_variants}
                  onChange={(e) => setNewTermData({ ...newTermData, banned_variants: e.target.value })}
                  placeholder="e.g. staff, employees, workers"
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-400"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Reason / Style Note</label>
              <input
                type="text"
                value={newTermData.note}
                onChange={(e) => setNewTermData({ ...newTermData, note: e.target.value })}
                placeholder="e.g. We celebrate our community culture and avoid impersonal corporate labels."
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setAddModalType(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-xl text-xs transition disabled:opacity-50"
              >
                {actionLoading ? 'Saving...' : 'Save Terminology'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-MODAL 3: ADD FACT */}
      {addModalType === 'fact' && (
        <div className="glass-panel border-cyan-500/40 rounded-2xl p-5 shadow-2xl animate-in fade-in space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Add Verified Company Fact for {brandDisplayName}</span>
            </h4>
            <button onClick={() => setAddModalType(null)} className="text-gray-400 hover:text-white">✕</button>
          </div>
          <form onSubmit={handleCreateFact} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-cyan-400 uppercase mb-1">Verified Fact Statement</label>
              <textarea
                value={newFactData.statement}
                onChange={(e) => setNewFactData({ ...newFactData, statement: e.target.value })}
                placeholder="e.g. Founded in 2021 with 40 operational retail stores nationwide."
                rows={2}
                className="w-full glass-input rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Source / Verification Document</label>
              <input
                type="text"
                value={newFactData.source}
                onChange={(e) => setNewFactData({ ...newFactData, source: e.target.value })}
                placeholder="e.g. Annual Audit Report 2026, SEC Filing, Corporate Press Release"
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setAddModalType(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold rounded-xl text-xs transition disabled:opacity-50"
              >
                {actionLoading ? 'Saving...' : 'Save Fact'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="py-16 text-center text-xs text-gray-400 flex items-center justify-center space-x-2">
          <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
          <span>Loading {brandDisplayName} knowledge base...</span>
        </div>
      ) : (
        <div>
          {/* TAB 1: RULES */}
          {activeSubTab === 'rules' && (
            rules.length === 0 ? (
              <div className="p-10 text-center rounded-2xl glass-card space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">No Guidelines Uploaded for {brandDisplayName}</h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
                    Upload your company brand book (PDF/DOCX) or click "Add Custom Rule" to establish your compliance guardrails.
                  </p>
                </div>
                <div className="flex justify-center space-x-3 pt-2">
                  <button
                    onClick={() => onOpenUploadModal ? onOpenUploadModal() : null}
                    className="px-5 py-2.5 glass-button-primary font-extrabold rounded-xl text-xs"
                  >
                    Upload Guidelines File
                  </button>
                  <button
                    onClick={() => setAddModalType('rule')}
                    className="px-4 py-2.5 glass-button-secondary font-semibold rounded-xl text-xs"
                  >
                    Add Rule Manually
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rules.map(r => (
                  <div key={r.id} className="glass-card rounded-2xl p-4 space-y-2.5 transition group hover:border-amber-500/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          {r.category}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          r.severity === 'high' ? 'bg-red-500/15 text-red-400 border border-red-500/30' :
                          r.severity === 'medium' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30' :
                          'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                        }`}>
                          {r.severity} severity
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteRule(r.id)}
                        title="Delete this guideline rule"
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-gray-100 leading-relaxed font-medium">
                      {r.clause_text}
                    </p>

                    <div className="text-[10px] text-gray-400 pt-2 border-t border-white/10 flex items-center justify-between">
                      <span className="truncate max-w-[200px]">Source: {r.source_doc || 'Brand Core'}</span>
                      <span className="font-mono text-gray-400">ID: {r.id.slice(0, 12)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* TAB 2: TERMS */}
          {activeSubTab === 'terms' && (
            terms.length === 0 ? (
              <div className="p-10 text-center rounded-2xl glass-card space-y-3">
                <p className="text-xs text-gray-400">No custom terminology defined for {brandDisplayName}.</p>
                <button
                  onClick={() => setAddModalType('term')}
                  className="px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold"
                >
                  + Add First Preferred Term
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {terms.map(t => (
                  <div key={t.id} className="glass-card rounded-2xl p-4 space-y-2.5 transition group hover:border-emerald-500/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                        Preferred: "{t.preferred}"
                      </span>
                      <button
                        onClick={() => handleDeleteTerm(t.id)}
                        title="Delete terminology entry"
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-xs text-gray-300">
                      <span className="text-gray-400 font-semibold">Banned Variants: </span>
                      <span className="text-red-400 font-medium">
                        {t.banned_variants?.map(v => `"${v}"`).join(', ') || 'None specified'}
                      </span>
                    </div>

                    {t.note && (
                      <p className="text-[11px] text-gray-400 italic glass-panel-subtle p-2.5 rounded-xl border border-white/5">
                        Note: {t.note}
                      </p>
                    )}

                    <div className="text-[10px] text-gray-400 pt-1 border-t border-white/10 flex justify-end">
                      <span className="font-mono">ID: {t.id.slice(0, 12)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* TAB 3: FACTS */}
          {activeSubTab === 'facts' && (
            facts.length === 0 ? (
              <div className="p-10 text-center rounded-2xl glass-card space-y-3">
                <p className="text-xs text-gray-400">No verified facts recorded for {brandDisplayName}.</p>
                <button
                  onClick={() => setAddModalType('fact')}
                  className="px-4 py-2 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-bold"
                >
                  + Add Brand Fact
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {facts.map(f => (
                  <div key={f.id} className="glass-card rounded-2xl p-4 space-y-2.5 transition group hover:border-cyan-500/30">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                        Verified Brand Fact
                      </span>
                      <button
                        onClick={() => handleDeleteFact(f.id)}
                        title="Delete brand fact"
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-gray-100 font-semibold leading-relaxed">
                      "{f.statement}"
                    </p>

                    <div className="text-[10px] text-gray-400 pt-2 border-t border-white/10 flex items-center justify-between">
                      <span>Source: {f.source || 'Corporate Record'}</span>
                      <span className="font-mono">ID: {f.id.slice(0, 12)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* TAB 4: ASSETS */}
          {activeSubTab === 'assets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assets.map(a => (
                <div key={a.id} className="glass-card rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                      {a.type} Asset
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">ID: {a.id.slice(0, 12)}</span>
                  </div>
                  <div className="text-xs font-mono text-amber-300 glass-panel-subtle p-2.5 rounded-xl border border-white/5 truncate">
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
      )}
    </div>
  );
}

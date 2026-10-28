import React, { useState, useRef } from 'react';
import {
  Upload, X, Check, FileText, AlertCircle, Sparkles,
  Building, BookOpen, Layers, CheckCircle2, ArrowRight
} from 'lucide-react';
import { importSourceFile } from '../api';

export default function UploadGuidelinesModal({
  isOpen,
  onClose,
  currentUser,
  onUploadSuccess,
  onNavigateToStudio
}) {
  const [file, setFile] = useState(null);
  const [brandName, setBrandName] = useState(currentUser?.brand_name || currentUser?.company_name || '');
  const [category, setCategory] = useState('general');
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError(null);
    const validExtensions = ['.pdf', '.docx', '.txt', '.md'];
    const name = selectedFile.name.toLowerCase();
    const isValid = validExtensions.some(ext => name.endsWith(ext));

    if (!isValid) {
      setError('Please upload a PDF (.pdf), Word Document (.docx), or Text File (.txt/.md).');
      return;
    }

    if (selectedFile.size > 25 * 1024 * 1024) {
      setError('File size exceeds 25 MB limit.');
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a guidelines file to upload.');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      if (currentUser?.workspace_id) {
        formData.append('workspace_id', currentUser.workspace_id);
      }
      if (brandName.trim()) {
        formData.append('brand_name', brandName.trim());
      }
      formData.append('category', category);
      formData.append('replace_existing', replaceExisting ? 'true' : 'false');

      const result = await importSourceFile(formData);
      setImportResult(result);
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload and parse guidelines.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError(null);
    setImportResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-panel border border-white/10 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Upload Company Brand Guidelines</h3>
              <p className="text-xs text-slate-400">
                Ground Sentinel&apos;s compliance engine to evaluate copy strictly against your company&apos;s handbook
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full glass-panel-subtle flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {!importResult ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Brand Name Input */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                  <Building className="w-3.5 h-3.5 text-amber-400" />
                  <span>Company / Brand Name</span>
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Acme Motors, Stripe, Tesla, My Company"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                  required
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Sentinel will tailor terminology, fact checking, and brand rules specifically for this brand name.
                </p>
              </div>

              {/* Focus Category */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Guideline Focus Scope
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="general">Comprehensive Brand Guide (Auto-categorize Tone, Terms, Claims & Visual)</option>
                  <option value="tone">Tone of Voice & Style Guide (Slang, Personality, Capitalization)</option>
                  <option value="terminology">Terminology & Product Glossary (Preferred vs Banned Terms)</option>
                  <option value="messaging">Messaging & Legal Guardrails (Substantiated Claims & Prohibitions)</option>
                  <option value="visual">Visual & Asset Standard (Contrast, Colors, Typography)</option>
                </select>
              </div>

              {/* Drag & Drop Dropzone */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Brand Guidelines Document (PDF, DOCX, TXT)
                </label>

                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                    dragActive
                      ? 'border-amber-400 bg-amber-500/10'
                      : file
                      ? 'border-emerald-500/50 bg-emerald-950/20'
                      : 'border-gray-800 hover:border-gray-700 bg-gray-950/50 hover:bg-gray-950'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,.md"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {file ? (
                    <div className="flex items-center justify-center space-x-3 text-emerald-400">
                      <FileText className="w-8 h-8 shrink-0" />
                      <div className="text-left">
                        <p className="text-xs font-bold text-white truncate max-w-sm">{file.name}</p>
                        <p className="text-[10px] text-gray-400">
                          {(file.size / 1024).toFixed(1)} KB &bull; Click to change document
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mx-auto text-amber-400">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-gray-200">
                        Drop company guidelines file here, or <span className="text-amber-400 underline">browse</span>
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Supports PDF, Word (.docx), Plain Text (.txt), or Markdown (.md) up to 25MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Replace existing checkbox */}
              <label className="flex items-center space-x-2.5 text-xs text-gray-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={replaceExisting}
                  onChange={(e) => setReplaceExisting(e.target.checked)}
                  className="rounded border-gray-700 bg-gray-950 text-amber-500 focus:ring-0"
                />
                <span>Replace previous imported guideline rules (clean slate for this company)</span>
              </label>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 via-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-gray-950 font-black px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-900/20 transition disabled:opacity-50 cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Ingesting & Extracting Rules...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload & Extract Guidelines</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Upload Success Result State */
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold text-sm text-white">Guidelines Successfully Ingested!</div>
                  <div className="text-xs text-emerald-300/90 mt-0.5">
                    Extracted <strong>{importResult.extracted_clauses_count} active rules</strong> and established guidelines for <strong className="text-white">{importResult.brand_name}</strong>.
                  </div>
                </div>
              </div>

              {/* Preview of Extracted Rules */}
              <div>
                <div className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Extracted Company Rules ({importResult.rules?.length || 0})</span>
                  <span className="text-[10px] text-amber-400 font-mono">Workspace: {importResult.workspace_id}</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {importResult.rules?.map((r, i) => (
                    <div key={i} className="p-3 bg-gray-950 border border-gray-800 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          {r.category}
                        </span>
                        <span className="text-gray-400 font-mono capitalize">Severity: {r.severity}</span>
                      </div>
                      <p className="text-xs text-gray-200 leading-relaxed font-medium">
                        {r.clause}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions after success */}
              <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-750 transition"
                >
                  View in Knowledge Base
                </button>

                <button
                  onClick={() => {
                    handleClose();
                    if (onNavigateToStudio) onNavigateToStudio();
                  }}
                  className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 via-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-gray-950 font-black px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-900/20 transition cursor-pointer"
                >
                  <span>Start Reviewing Content</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

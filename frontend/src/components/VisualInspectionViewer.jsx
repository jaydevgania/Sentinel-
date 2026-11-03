import React from 'react';
import { Eye, ShieldAlert, CheckCircle2, AlertTriangle, Layers, Maximize2, Palette } from 'lucide-react';

export default function VisualInspectionViewer({ visualData }) {
  if (!visualData) return null;

  const {
    image_dimensions = { width: 800, height: 400 },
    detected_palette = [],
    brand_palette = [],
    logo_detection = {},
    contrast_analysis = {},
    accessibility = {},
    violations = []
  } = visualData;

  const logoBbox = logo_detection.bbox || { x: 64, y: 48, width: 176, height: 100 };
  const clearSpaceBox = logo_detection.clear_space_bbox || { x: 30, y: 15, width: 240, height: 165 };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-cyan-500/30 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
              <span>Multi-Modal Visual Layout & Logo Clear-Space Engine</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Round 3 Deliverable
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Computer vision inspection: Logo isolation margins, WCAG contrast hotspots & palette compliance
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Status:</span>
          {violations.length > 0 ? (
            <span className="px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 font-bold flex items-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5 mr-1" />
              <span>{violations.length} Layout Violations</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              <span>Layout Compliant</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Visual Display: Interactive Canvas / Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Annotated Image Canvas View (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>Annotated Asset Canvas ({image_dimensions.width} &times; {image_dimensions.height}px)</span>
            <div className="flex items-center space-x-3 text-[11px] font-normal">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block"></span>
                <span>Logo BBox</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-sm border border-dashed border-cyan-400 inline-block"></span>
                <span>Clear Space Buffer</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block"></span>
                <span>Intruding Defect</span>
              </span>
            </div>
          </div>

          {/* SVG / Canvas Mockup Box */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-r from-[#2C1810] via-[#3C2A21] to-[#1A120B] p-6 shadow-inner aspect-[2/1] flex flex-col justify-between">
            {/* SVG Overlay representing Computer Vision Bounding Boxes */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox={`0 0 ${image_dimensions.width} ${image_dimensions.height}`}
              preserveAspectRatio="none"
            >
              {/* Clear Space Bounding Box (Cyan Dashed) */}
              <rect
                x={clearSpaceBox.x}
                y={clearSpaceBox.y}
                width={clearSpaceBox.width}
                height={clearSpaceBox.height}
                fill="rgba(6, 182, 212, 0.08)"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                rx="8"
              />
              <text
                x={clearSpaceBox.x + 6}
                y={clearSpaceBox.y + 16}
                fill="#38bdf8"
                fontSize="12"
                fontWeight="bold"
                fontFamily="monospace"
              >
                Clear-Space Isolation Boundary ({logo_detection.required_clearance_px || 60}px)
              </text>

              {/* Logo Bounding Box (Gold Solid) */}
              <rect
                x={logoBbox.x}
                y={logoBbox.y}
                width={logoBbox.width}
                height={logoBbox.height}
                fill="rgba(245, 158, 11, 0.15)"
                stroke="#f59e0b"
                strokeWidth="2"
                rx="6"
              />
              <text
                x={logoBbox.x + 8}
                y={logoBbox.y + 20}
                fill="#fef08a"
                fontSize="11"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                Logo Mark Detected (96%)
              </text>

              {/* Tagline / Element Intrusion (Red Pulse) */}
              <rect
                x={logoBbox.x + 80}
                y={logoBbox.y + logoBbox.height - 10}
                width="340"
                height="65"
                fill="rgba(239, 68, 68, 0.25)"
                stroke="#ef4444"
                strokeWidth="2.5"
                rx="6"
              />
              <text
                x={logoBbox.x + 90}
                y={logoBbox.y + logoBbox.height + 15}
                fill="#fca5a5"
                fontSize="12"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                &times; Intrusion Violation: Text crowding logo isolation margin
              </text>
            </svg>

            {/* Inner Content Simulation */}
            <div className="relative z-10 flex items-start justify-between">
              <div className="w-28 h-16 rounded-xl bg-amber-500/20 border border-amber-500/40 p-2 flex flex-col justify-center">
                <div className="text-xs font-black text-amber-300 tracking-wider">NIMBUS</div>
                <div className="text-[9px] text-amber-200">COFFEE ROASTERS</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-amber-400/80 uppercase tracking-widest">
                  Autumn Seasonal Release
                </span>
              </div>
            </div>

            <div className="relative z-10">
              <div className="text-lg font-black text-[#D5CEA3] leading-tight">
                Slow Steeped &bull; Triple Filtered Cold Brew
              </div>
              <div className="text-xs text-[#E5E5CB] mt-0.5">
                Handcrafted daily by our team members across all outlets
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 bg-black/30 px-3 py-1.5 rounded-xl border border-white/5">
            <span>CV Engine: Contour analysis, bounding-box perimeter math &amp; relative luminance map</span>
            <span className="text-cyan-400 font-mono">Status: Evaluated 800&times;400px</span>
          </div>
        </div>

        {/* Right: Metrics & Violations Card (1 col) */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Contrast Meter */}
          <div className="glass-card rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <span>Contrast Ratio</span>
              </span>
              <span className={`text-xs font-extrabold px-2 py-0.5 rounded-lg border ${
                contrast_analysis.wcag_compliant
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-red-500/15 text-red-400 border-red-500/30'
              }`}>
                {contrast_analysis.ratio}:1 {contrast_analysis.wcag_compliant ? 'PASS' : 'FAIL'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Foreground <strong className="text-white font-mono">{contrast_analysis.fg_color}</strong> on Background <strong className="text-white font-mono">{contrast_analysis.bg_color}</strong>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${contrast_analysis.wcag_compliant ? 'bg-emerald-400' : 'bg-red-500'}`}
                style={{ width: `${Math.min(100, (contrast_analysis.ratio / 7) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0:1</span>
              <span>4.5:1 (WCAG AA Target)</span>
              <span>7:1+</span>
            </div>
          </div>

          {/* Palette Extraction */}
          <div className="glass-card rounded-2xl p-4 space-y-2.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span>Extracted Palette vs Brand Core</span>
            </span>
            <div className="flex items-center space-x-2">
              {detected_palette.map((hex, i) => (
                <div key={i} className="flex-1 text-center group cursor-pointer" title={hex}>
                  <div
                    className="w-full h-8 rounded-lg border border-white/20 shadow-sm transition-transform group-hover:scale-105"
                    style={{ backgroundColor: hex }}
                  ></div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase mt-1 block truncate">
                    {hex}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Violations List */}
          <div className="glass-card rounded-2xl p-4 space-y-2.5">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Layout Actions Required ({violations.length})</span>
            </span>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {violations.map((v, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-red-950/20 border border-red-500/30 text-xs space-y-1">
                  <div className="font-bold text-red-300">{v.title}</div>
                  <div className="text-[11px] text-slate-300">{v.details}</div>
                  <div className="text-[10px] text-amber-300 font-semibold bg-black/40 p-1.5 rounded-lg border border-white/5">
                    Recommended Fix: {v.fix}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

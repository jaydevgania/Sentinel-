import React from 'react';
import { AlertTriangle, CheckCircle, FileText, Sparkles, Sliders, Image, Award } from 'lucide-react';

export default function SamplePicker({ samples, onSelectSample, activeSampleId }) {
  const getBadge = (sampleId) => {
    switch (sampleId) {
      case 'sample-1':
        return { label: 'Claim Checker', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30', icon: AlertTriangle };
      case 'sample-2':
        return { label: 'Fact Contradiction', color: 'bg-orange-500/15 text-orange-300 border-orange-500/30', icon: AlertTriangle };
      case 'sample-3':
        return { label: 'Terminology', color: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30', icon: Sliders };
      case 'sample-4':
        return { label: 'Tone & Slang', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30', icon: Sparkles };
      case 'sample-5':
        return { label: 'Visual & A11y', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', icon: Image };
      case 'sample-6':
        return { label: 'Clean Pass (100%)', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', icon: CheckCircle };
      default:
        return { label: 'Demo Post', color: 'bg-white/5 text-slate-300 border-white/10', icon: FileText };
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Award className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Quick-Test Suite (Nimbus Coffee Preloaded Posts)
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">Click any card to load test case</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {samples.map((s) => {
          const badge = getBadge(s.id);
          const Icon = badge.icon;
          const isSelected = activeSampleId === s.id;

          return (
            <button
              key={s.id}
              onClick={() => onSelectSample(s)}
              className={`text-left p-3.5 rounded-2xl transition-all flex flex-col justify-between group cursor-pointer ${
                isSelected
                  ? 'glass-card-glow-amber scale-[1.02] border-amber-500/50 shadow-lg shadow-amber-500/15'
                  : 'glass-card hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center space-x-1 ${badge.color}`}>
                    <Icon className="w-2.5 h-2.5 mr-1" />
                    <span>{badge.label}</span>
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                  {s.title}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                  {s.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                <span className="capitalize font-medium">{s.channel}</span>
                <span className="text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform">Load &rarr;</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

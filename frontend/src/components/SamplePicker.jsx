import React from 'react';
import { AlertTriangle, CheckCircle, FileText, Sparkles, Sliders, Image, Award } from 'lucide-react';

export default function SamplePicker({ samples, onSelectSample, activeSampleId }) {
  const getBadge = (sampleId) => {
    switch (sampleId) {
      case 'sample-1':
        return { label: 'Claim Checker', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30', icon: AlertTriangle };
      case 'sample-2':
        return { label: 'Fact Contradiction', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30', icon: AlertTriangle };
      case 'sample-3':
        return { label: 'Terminology', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', icon: Sliders };
      case 'sample-4':
        return { label: 'Tone & Slang', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30', icon: Sparkles };
      case 'sample-5':
        return { label: 'Visual & A11y', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', icon: Image };
      case 'sample-6':
        return { label: 'Clean Pass (100%)', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: CheckCircle };
      default:
        return { label: 'Demo Post', color: 'bg-gray-500/10 text-gray-400 border-gray-500/30', icon: FileText };
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Award className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">
            Judge Quick-Test Suite (Nimbus Coffee Preloaded Posts)
          </h3>
        </div>
        <span className="text-[11px] text-gray-400">Click any card to load test case</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {samples.map((s) => {
          const badge = getBadge(s.id);
          const Icon = badge.icon;
          const isSelected = activeSampleId === s.id;

          return (
            <button
              key={s.id}
              onClick={() => onSelectSample(s)}
              className={`text-left p-3 rounded-xl border transition flex flex-col justify-between group ${
                isSelected
                  ? 'bg-amber-950/30 border-amber-500/60 shadow-md shadow-amber-900/20'
                  : 'bg-gray-900/60 border-gray-800 hover:border-gray-700 hover:bg-gray-850'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center space-x-1 ${badge.color}`}>
                    <Icon className="w-2.5 h-2.5 mr-1" />
                    <span>{badge.label}</span>
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-gray-200 line-clamp-1 group-hover:text-amber-400 transition">
                  {s.title}
                </h4>
                <p className="text-[11px] text-gray-400 line-clamp-2 mt-1 leading-snug">
                  {s.description}
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-gray-800/80 flex items-center justify-between text-[10px] text-gray-400">
                <span className="capitalize">{s.channel}</span>
                <span className="text-amber-400 font-semibold group-hover:translate-x-0.5 transition">Load &rarr;</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

'use client';
import { CheckCircle2 } from 'lucide-react';
import { DECISION_SUMMARY } from '@/lib/constants';

interface DecisionSummaryCardProps {
  show: boolean;
}

export default function DecisionSummaryCard({ show }: DecisionSummaryCardProps) {
  if (!show) return null;

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-[3rem] shadow-2xl text-white border border-slate-700 animate-in zoom-in-95 duration-1000 relative">
      <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
        <CheckCircle2 size={24} className="text-blue-400" />
        <h2 className="font-black text-lg tracking-tighter uppercase">Decision Summary</h2>
      </div>
      <div className="space-y-4">
        {DECISION_SUMMARY.map((s) => (
          <div
            key={s.tag}
            className="flex items-start gap-4 text-xs bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors"
          >
            <span className="bg-blue-600 text-white font-black px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-widest">
              {s.tag}
            </span>
            <p className="font-bold leading-relaxed opacity-90">{s.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';
import { Award, Volume2 } from 'lucide-react';
import { ROLE_COLORS } from '@/lib/constants';
import type { DialogueLine } from '@/types/meeting';

interface DialogueMessageProps {
  log: DialogueLine;
  stepTitle: string;
  isActive: boolean;
}

export default function DialogueMessage({ log, stepTitle, isActive }: DialogueMessageProps) {
  return (
    <div className="flex flex-col items-start animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="flex gap-4 w-full items-start">
        {/* 발화자 아바타 */}
        <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 font-black shadow-xl border-b-4 transition-transform hover:scale-105 overflow-hidden ${ROLE_COLORS[log.role]}`}>
          <span className="mb-1 text-center leading-tight px-1 text-[8px] w-full break-keep">{log.role}</span>
          <div className="bg-black/20 p-1 rounded-lg shrink-0">
            <Volume2 size={10} />
          </div>
        </div>

        {/* 발언 내용 */}
        <div className="flex-1 space-y-2 pt-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{log.role} 발언</span>
              {isActive && <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />}
            </div>
            {/* 단계 라벨 — 우측 */}
            {stepTitle && (
              <span className="text-[9px] font-black text-blue-400/70 bg-blue-900/30 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                {stepTitle}
              </span>
            )}
          </div>
          <div className="bg-slate-800/90 backdrop-blur-md text-slate-100 px-6 py-4 rounded-[2rem] rounded-tl-none border border-slate-700/50 shadow-inner text-[14px] leading-relaxed relative">
            {log.text}
            {log.role === '장학사' && (
              <Award size={12} className="absolute top-3 right-5 text-blue-500 opacity-30" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';
import type { MeetingStep } from '@/types/meeting';

interface MeetingTimelineProps {
  steps: MeetingStep[];
  currentStep: number;
  isStarted: boolean;
}

export default function MeetingTimeline({ steps, currentStep, isStarted }: MeetingTimelineProps) {
  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-8 font-black text-xs text-slate-400 tracking-[0.2em]">
        <span>MEETING TIMELINE</span>
        <span className="text-blue-600 italic">
          STAGE {!isStarted ? 0 : currentStep + 1} / {steps.length}
        </span>
      </div>

      <div className="relative flex justify-between">
        {steps.map((s, idx) => {
          const isDone    = isStarted && idx < currentStep;
          const isCurrent = isStarted && idx === currentStep;

          return (
            <div key={idx} className="flex flex-col items-center z-10 w-1/6">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-all duration-700 border-2 ${
                  isDone
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                    : isCurrent
                    ? 'bg-white border-blue-600 text-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.2)] scale-110'
                    : 'bg-slate-50 border-slate-100 text-slate-300'
                }`}
              >
                {idx + 1}
              </div>
              <span
                className={`text-[9px] mt-4 font-black text-center leading-tight uppercase tracking-tighter ${
                  isCurrent ? 'text-blue-600' : 'text-slate-400'
                }`}
              >
                {s.title.split('. ')[1]}
              </span>
            </div>
          );
        })}

        {/* 배경 트랙 */}
        <div className="absolute top-6 left-0 w-full h-[1px] bg-slate-100 -z-0" />

        {/* 진행 트랙 */}
        {isStarted && (
          <div
            className="absolute top-6 left-0 h-[1px] bg-blue-600 transition-all duration-1000 -z-0"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        )}
      </div>
    </div>
  );
}

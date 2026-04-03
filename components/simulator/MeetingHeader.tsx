'use client';
import { Activity, CheckCircle2, Download, Loader2, Mic2, Play, RefreshCw, Volume2, VolumeX } from 'lucide-react';

interface MeetingHeaderProps {
  isMuted: boolean;
  isStarted: boolean;
  isFinished: boolean;
  isPreloading: boolean;
  isSaving: boolean;
  isReady: boolean;
  preloadProgress: number;
  preloadTotal: number;
  currentStep: number;
  totalSteps: number;
  onToggleMute: () => void;
  onReset: () => void;
  onStart: () => void;
  onRegenerate: () => void;
  onSaveNow: () => void;
}

export default function MeetingHeader({
  isMuted,
  isStarted,
  isFinished,
  isPreloading,
  isSaving,
  isReady,
  preloadProgress,
  preloadTotal,
  currentStep,
  totalSteps,
  onToggleMute,
  onReset,
  onStart,
  onRegenerate,
  onSaveNow,
}: MeetingHeaderProps) {
  const btnDisabled = isPreloading || isStarted;

  const btnLabel = isFinished
    ? '회의 완료'
    : isStarted
    ? `진행 중 (${currentStep + 1}/${totalSteps})`
    : isPreloading
    ? `녹음 중... (${preloadProgress}/${preloadTotal})`
    : '회의 시작';

  const btnIcon = isFinished ? (
    <CheckCircle2 size={22} />
  ) : isStarted || isPreloading ? (
    <Loader2 size={22} className="animate-spin" />
  ) : (
    <Play size={22} />
  );

  const statusText = isPreloading
    ? `오디오 생성 중 — ${preloadProgress}/${preloadTotal} 단계`
    : isSaving
    ? '파일 저장 중...'
    : isReady && !isStarted
    ? '녹음 완료 — 시작 버튼을 누르면 전체 회의가 자동 진행됩니다'
    : isStarted && !isFinished
    ? `${currentStep + 1}단계 진행 중`
    : isFinished
    ? '회의가 종료되었습니다'
    : '준비 중...';

  return (
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
      <div className="space-y-2 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-3">
          <div className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse shadow-lg">
            {isPreloading ? 'PREPARING' : isStarted && !isFinished ? 'LIVE' : 'READY'}
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-800">
            지역기관 통합 사례회의{' '}
            <Activity size={24} className="inline text-blue-600" />
          </h1>
        </div>
        <p className="text-slate-500 text-sm font-bold flex items-center justify-center md:justify-start gap-2">
          <Mic2 size={16} className="text-blue-500" />
          {statusText}
        </p>

        {isPreloading && (
          <div className="w-64 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${(preloadProgress / preloadTotal) * 100}%` }}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-xl border border-slate-200">
        {/* 뮤트 */}
        <button
          onClick={onToggleMute}
          className={`p-4 rounded-xl transition-all ${
            isMuted ? 'bg-red-50 text-red-500 shadow-inner' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>

        {/* 파일 저장 */}
        {isReady && !isStarted && (
          <button
            onClick={onSaveNow}
            disabled={isSaving}
            title="로컬 파일로 저장"
            className={`p-4 rounded-xl transition-all ${
              isSaving
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                : 'bg-slate-50 text-slate-400 hover:text-green-600 hover:bg-green-50'
            }`}
          >
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
          </button>
        )}

        {/* 재생성 */}
        {isReady && !isStarted && (
          <button
            onClick={onRegenerate}
            title="오디오 재생성"
            className="p-4 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <RefreshCw size={20} />
          </button>
        )}

        <button
          onClick={onReset}
          className="px-6 py-4 text-xs font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
        >
          Reset
        </button>

        <button
          onClick={onStart}
          disabled={btnDisabled}
          className={`px-10 py-5 text-sm font-black text-white rounded-2xl flex items-center gap-3 shadow-2xl transition-all active:scale-95 ${
            btnDisabled
              ? 'bg-slate-300 shadow-none cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {btnIcon}
          {btnLabel}
        </button>
      </div>
    </div>
  );
}

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useMeetingState } from '@/hooks/useMeetingState';
import { useTTS } from '@/hooks/useTTS';
import { useAudioPreloader } from '@/hooks/useAudioPreloader';
import { clearSavedSession } from '@/hooks/useMeetingPersistence';
import { STEPS, ALL_LINES } from '@/lib/constants';

import ErrorBanner from '@/components/ui/ErrorBanner';
import MeetingHeader from './MeetingHeader';
import MeetingTimeline from './MeetingTimeline';
import DialoguePanel from './DialoguePanel';
import AudioProfileCard from './AudioProfileCard';
import RiskDashboard from './RiskDashboard';
import DecisionSummaryCard from './DecisionSummaryCard';

export default function MeetingSimulator() {
  const { state, dispatch, isStarted, isFinished } = useMeetingState();

  const {
    audioCache, isPreloading, isSaving, progress,
    isReady, total, error: preloadError,
    retry, regenerate, saveNow,
  } = useAudioPreloader();

  const { playPreloaded } = useTTS({
    isMuted: state.isMuted,
    onSpeakingChange: (value) => dispatch({ type: 'SET_SPEAKING', value }),
    onError: (message) => dispatch({ type: 'SET_ERROR', message }),
  });

  // 항상 최신 값 — stale 클로저 방지
  const audioCacheRef = useRef(audioCache);
  useEffect(() => { audioCacheRef.current = audioCache; }, [audioCache]);
  const dispatchRef = useRef(dispatch);
  useEffect(() => { dispatchRef.current = dispatch; }, [dispatch]);
  const playPreloadedRef = useRef(playPreloaded);
  useEffect(() => { playPreloadedRef.current = playPreloaded; }, [playPreloaded]);

  // 라인별 순차 재생 (콜백 체인)
  const playLine = useCallback((lineIndex: number) => {
    if (lineIndex >= ALL_LINES.length) return;

    const lineInfo = ALL_LINES[lineIndex];
    const cached = audioCacheRef.current[lineIndex];
    if (!cached) return;

    // UI 업데이트: 해당 발언을 대화창에 추가, 단계 업데이트
    dispatchRef.current({ type: 'ADD_LINE', line: { role: lineInfo.role, text: lineInfo.text }, step: lineInfo.step });

    playPreloadedRef.current(cached, () => {
      const next = lineIndex + 1;
      if (next < ALL_LINES.length) {
        const stepChanged = ALL_LINES[next].step !== lineInfo.step;
        setTimeout(() => playLine(next), stepChanged ? 3000 : 0);
      }
    });
  }, []); // ref 기반이므로 의존성 없음

  const handleStart = () => {
    if (!isReady || isStarted) return;
    dispatch({ type: 'START_MEETING' });
    // START_MEETING dispatch 처리 후 첫 라인 시작
    // ADD_LINE은 playPreloaded 콜백 내부에서 실행되므로 배치 업데이트 문제 없음
    setTimeout(() => playLine(0), 0);
  };

  const handleReset = () => {
    dispatch({ type: 'RESET' });
    clearSavedSession();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans text-slate-900">

      {state.error && (
        <ErrorBanner
          message={state.error}
          onClose={() => dispatch({ type: 'SET_ERROR', message: null })}
        />
      )}

      {preloadError && (
        <ErrorBanner
          message={`사전 녹음 오류: ${preloadError}`}
          onClose={retry}
        />
      )}

      <MeetingHeader
        isMuted={state.isMuted}
        isStarted={isStarted}
        isFinished={isFinished}
        isPreloading={isPreloading}
        isSaving={isSaving}
        isReady={isReady}
        preloadProgress={progress}
        preloadTotal={total}
        currentStep={state.currentStep}
        totalSteps={STEPS.length}
        onToggleMute={() => dispatch({ type: 'TOGGLE_MUTE' })}
        onReset={handleReset}
        onStart={handleStart}
        onRegenerate={regenerate}
        onSaveNow={saveNow}
      />

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <MeetingTimeline steps={STEPS} currentStep={state.currentStep} isStarted={isStarted} />
          <DialoguePanel
            logs={state.logs}
            currentStep={state.currentStep}
            isSpeaking={state.isSpeaking}
            isStarted={isStarted}
          />
        </div>
        <div className="lg:col-span-4 space-y-8">
          <RiskDashboard riskLevels={state.riskLevels} />
          <DecisionSummaryCard show={isStarted && state.currentStep >= 4} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-16 pt-8 border-t border-slate-200 text-center space-y-3">
        <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.6em]">
          Educational Integrated Case Management AI Simulator
        </p>
        <p className="text-xs font-bold text-slate-400 italic">
          &ldquo;한 아이를 지키기 위해 온 전문가의 목소리가 하나로 모입니다.&rdquo;
        </p>
        <p className="text-[11px] text-slate-400">
          &copy; {new Date().getFullYear()} 신연옥. All rights reserved.
        </p>
      </div>
    </div>
  );
}

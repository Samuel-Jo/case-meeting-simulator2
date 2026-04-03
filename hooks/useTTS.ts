'use client';

import { useCallback, useRef } from 'react';
import { base64PcmToAudio } from '@/lib/audio';

interface UseTTSOptions {
  isMuted: boolean;
  onSpeakingChange: (value: boolean) => void;
  onError: (message: string | null) => void;
}

export function useTTS({ isMuted, onSpeakingChange, onError }: UseTTSOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 최신 콜백 ref — stale 클로저 방지
  const onSpeakingChangeRef = useRef(onSpeakingChange);
  onSpeakingChangeRef.current = onSpeakingChange;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  /**
   * 사전 녹음된 base64 PCM 재생
   * @param audioData  base64 PCM 문자열
   * @param onEnded    재생 완료 시 호출할 콜백 (자동 진행에 사용)
   */
  const playPreloaded = useCallback((audioData: string, onEnded?: () => void) => {
    if (isMutedRef.current) {
      // 음소거 상태면 재생 없이 바로 완료 콜백 호출 → 자동 진행은 계속
      onEnded?.();
      return;
    }

    // 기존 재생 중단
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }

    onSpeakingChangeRef.current(true);
    onErrorRef.current(null);

    try {
      const { audio, url } = base64PcmToAudio(audioData);
      audioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(url);
        audioRef.current = null;
        onSpeakingChangeRef.current(false);
        onEnded?.();           // ← 완료 콜백 직접 호출
      };

      audio.onerror = () => {
        URL.revokeObjectURL(url);
        audioRef.current = null;
        onSpeakingChangeRef.current(false);
        onErrorRef.current('오디오 재생에 실패했습니다.');
      };

      audio.play().catch((err) => {
        URL.revokeObjectURL(url);
        audioRef.current = null;
        onSpeakingChangeRef.current(false);
        onErrorRef.current(`재생 오류: ${err?.message ?? err}`);
      });
    } catch {
      audioRef.current = null;
      onSpeakingChangeRef.current(false);
      onErrorRef.current('오디오 변환에 실패했습니다.');
    }
  }, []);

  return { playPreloaded };
}

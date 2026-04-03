'use client';

import { useState, useEffect, useCallback } from 'react';
import { ALL_LINES, AUDIO_CACHE_VERSION } from '@/lib/constants';

const total = ALL_LINES.length;

// public/audio/lines/ 에서 전체 캐시 로드
async function loadFromFiles(): Promise<string[] | null> {
  try {
    const manifestRes = await fetch(`/audio/lines/manifest.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!manifestRes.ok) return null;
    const manifest = await manifestRes.json() as { version: string; count: number };
    if (manifest.version !== AUDIO_CACHE_VERSION || manifest.count !== total) return null;

    const cache: string[] = [];
    for (let i = 0; i < total; i++) {
      const fileName = `line_${String(i).padStart(2, '0')}.b64`;
      const res = await fetch(`/audio/lines/${fileName}`, { cache: 'force-cache' });
      if (!res.ok) return null;
      cache.push(await res.text());
    }
    return cache;
  } catch {
    return null;
  }
}

async function saveToFiles(cache: string[]): Promise<void> {
  await fetch('/api/audio/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cache }),
  });
}

export interface PreloadState {
  audioCache: (string | null)[];
  isPreloading: boolean;
  isSaving: boolean;
  progress: number;
  error: string | null;
}

export function useAudioPreloader() {
  const [state, setState] = useState<PreloadState>({
    audioCache: Array(total).fill(null),
    isPreloading: false,
    isSaving: false,
    progress: 0,
    error: null,
  });

  const preload = useCallback(async (forceRegenerate = false) => {
    setState({ audioCache: Array(total).fill(null), isPreloading: true, isSaving: false, progress: 0, error: null });

    // 1순위: 파일 캐시 (재생성 강제가 아닐 때)
    if (!forceRegenerate) {
      const fromFiles = await loadFromFiles();
      if (fromFiles) {
        setState({ audioCache: fromFiles, isPreloading: false, isSaving: false, progress: total, error: null });
        return;
      }
    }

    // 2순위: API로 라인별 생성
    const cache: (string | null)[] = Array(total).fill(null);

    for (let i = 0; i < total; i++) {
      const line = ALL_LINES[i];
      const MAX_RETRIES = 4;
      const RETRY_DELAYS = [3000, 6000, 12000, 24000];
      let lastError = '';
      let success = false;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (attempt > 0) await new Promise(r => setTimeout(r, RETRY_DELAYS[attempt - 1]));
        try {
          const res = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ line: { role: line.role, text: line.text } }),
          });
          if (!res.ok) {
            const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
            lastError = body.error ?? `HTTP ${res.status}`;
            if (res.status < 500) break;
            continue;
          }
          const { audioData } = await res.json();
          cache[i] = audioData;
          success = true;
          break;
        } catch (err) {
          lastError = err instanceof Error ? err.message : '네트워크 오류';
        }
      }

      if (!success) {
        setState(prev => ({ ...prev, isPreloading: false, error: `${i + 1}번 발언(${line.role}): ${lastError}` }));
        return;
      }

      setState(prev => ({ ...prev, audioCache: [...cache], progress: i + 1 }));
    }

    const finalCache = cache as string[];
    setState({ audioCache: finalCache, isPreloading: false, isSaving: true, progress: total, error: null });

    // 생성 완료 후 자동으로 파일 저장
    try {
      await saveToFiles(finalCache);
    } finally {
      setState(prev => ({ ...prev, isSaving: false }));
    }
  }, []);

  useEffect(() => { preload(); }, [preload]);

  const isReady = !state.isPreloading && state.progress === total && !state.error;

  return {
    ...state,
    isReady,
    total,
    retry: () => preload(false),
    regenerate: () => preload(true),
    saveNow: async () => {
      if (state.audioCache.every(Boolean)) {
        setState(prev => ({ ...prev, isSaving: true }));
        try { await saveToFiles(state.audioCache as string[]); }
        finally { setState(prev => ({ ...prev, isSaving: false })); }
      }
    },
  };
}

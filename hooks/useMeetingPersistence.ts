// ============================================================
// useMeetingPersistence — localStorage 저장/복원
// 스키마 키: 'meeting_session_v1' (변경 시 새 키 사용)
// ============================================================
'use client';

import { useEffect } from 'react';
import type { MeetingState, PersistedSession } from '@/types/meeting';

const STORAGE_KEY = 'meeting_session_v1';

/**
 * 회의 상태가 바뀔 때마다 localStorage에 저장
 */
export function useMeetingPersistence(state: MeetingState) {
  useEffect(() => {
    // 회의가 시작된 경우에만 저장
    if (state.logs.length === 0) return;

    const session: PersistedSession = {
      currentStep: state.currentStep,
      logs: state.logs,
      riskLevels: state.riskLevels,
      savedAt: new Date().toISOString(),
      schemaVersion: 'v1',
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // localStorage 쓰기 실패 (시크릿 모드 등) — 무시
    }
  }, [state.currentStep, state.logs, state.riskLevels]);
}

/**
 * 저장된 세션 불러오기 — 진행 상태(logs/riskLevels)만 복원, isStarted는 복원하지 않음
 * 파싱 실패 시 null 반환 (초기 상태 사용)
 */
export function loadSavedSession(): Pick<MeetingState, 'currentStep' | 'logs' | 'riskLevels'> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw) as PersistedSession;

    // 스키마 버전 검증
    if (session.schemaVersion !== 'v1') return null;

    return {
      currentStep: session.currentStep,
      logs: session.logs,
      riskLevels: session.riskLevels,
    };
  } catch {
    // 파싱 실패 시 스토리지 정리 후 null 반환
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
    return null;
  }
}

/**
 * 저장된 세션 삭제 (Reset 시 호출)
 */
export function clearSavedSession() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
}

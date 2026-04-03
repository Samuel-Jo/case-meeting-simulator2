// ============================================================
// useMeetingState — useReducer 기반 회의 상태 머신
// per-line 재생 모델: ADD_LINE으로 한 줄씩 로그에 추가
// ============================================================
'use client';

import { useReducer } from 'react';
import { INITIAL_RISK_LEVELS, RISK_UPDATES, ALL_LINES } from '@/lib/constants';
import type { MeetingState, DialogueLine } from '@/types/meeting';

type Action =
  | { type: 'START_MEETING' }
  | { type: 'ADD_LINE'; line: DialogueLine; step: number }
  | { type: 'RESET' }
  | { type: 'SET_SPEAKING'; value: boolean }
  | { type: 'SET_ERROR'; message: string | null }
  | { type: 'TOGGLE_MUTE' };

const initialState: MeetingState = {
  currentStep: 0,
  logs: [],
  riskLevels: { ...INITIAL_RISK_LEVELS },
  isMuted: false,
  isSpeaking: false,
  error: null,
};

function reducer(state: MeetingState, action: Action): MeetingState {
  switch (action.type) {
    case 'START_MEETING':
      return { ...state, currentStep: 0, logs: [], error: null };

    case 'ADD_LINE': {
      const { line, step } = action;
      const stepChanged = step !== state.currentStep;
      const riskUpdate = stepChanged ? RISK_UPDATES[step] : undefined;
      return {
        ...state,
        currentStep: step,
        logs: [...state.logs, line],
        riskLevels: riskUpdate ? { ...state.riskLevels, ...riskUpdate } : state.riskLevels,
      };
    }

    case 'RESET':
      return { ...initialState };

    case 'SET_SPEAKING':
      return { ...state, isSpeaking: action.value };

    case 'SET_ERROR':
      return { ...state, error: action.message, isSpeaking: false };

    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted };

    default:
      return state;
  }
}

export function useMeetingState() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const isStarted = state.logs.length > 0;
  const isFinished = state.logs.length === ALL_LINES.length;

  return { state, dispatch, isStarted, isFinished };
}

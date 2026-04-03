// ============================================================
// POST /api/tts — 단일 화자 Gemini TTS 프록시 (보안 핵심)
// API 키는 서버 환경변수에서만 사용 — 클라이언트에 절대 노출 안 됨
// 라인 1개 → 음성 1개 → API 1회 호출 → 항상 올바른 목소리
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { generateSingleTTS } from '@/lib/gemini';
import { VOICE_MAP } from '@/lib/constants';
import type { DialogueLine } from '@/types/meeting';


export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  let line: DialogueLine;
  try {
    const body = await req.json();
    line = body.line;
    if (!line?.role || !line?.text) {
      return NextResponse.json({ error: '잘못된 요청 형식' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식' }, { status: 400 });
  }

  const voiceName = VOICE_MAP[line.role];
  if (!voiceName) {
    return NextResponse.json({ error: `알 수 없는 역할: ${line.role}` }, { status: 400 });
  }

  try {
    const audioData = await generateSingleTTS(line.text, voiceName, apiKey);
    return NextResponse.json({ audioData });
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    console.error('[/api/tts]', message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

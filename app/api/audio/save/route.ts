// ============================================================
// POST /api/audio/save — 오디오 캐시 저장 엔드포인트
// Cloudflare Workers 환경에서는 파일시스템 쓰기가 불가하므로 no-op
// public/audio/lines/ 정적 파일이 사전 배포되어 있으면 그것을 사용
// ============================================================
import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest) {
  return NextResponse.json({ ok: true, skipped: true });
}

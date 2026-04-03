// ============================================================
// Gemini API 클라이언트 — 서버사이드 전용 (Node.js 환경)
// ============================================================
import { TTS_MODEL, VOICE_MAP } from '@/lib/constants';
import type { DialogueLine, SpeakerRole, VoiceName } from '@/types/meeting';

/**
 * 단일 화자 TTS — 1개 라인, 1개 음성, 1회 API 호출
 * multiSpeakerVoiceConfig 없이 prebuiltVoiceConfig 만 사용 → 항상 올바른 음성
 * @returns base64 인코딩된 오디오 데이터 문자열
 */
export async function generateSingleTTS(
  text: string,
  voiceName: VoiceName,
  apiKey: string
): Promise<string> {
  const payload = {
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Gemini API ${response.status}: ${body}`);
  }

  const result = await response.json();
  const audioData: string | undefined =
    result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audioData) throw new Error('Gemini 응답에 오디오 데이터가 없습니다.');
  return audioData;
}

interface SpeakerVoiceConfig {
  speaker: string;
  voiceConfig: {
    prebuiltVoiceConfig: {
      voiceName: VoiceName;
    };
  };
}

/**
 * Gemini TTS 제약: speakerVoiceConfigs 는 정확히 2개.
 * → 대화 라인을 최대 2명의 화자가 등장하는 그룹으로 분할.
 * 같은 화자가 연속 발언해도 하나의 그룹으로 유지.
 */
export function splitByTwoSpeakers(lines: DialogueLine[]): DialogueLine[][] {
  const groups: DialogueLine[][] = [];
  let currentGroup: DialogueLine[] = [];
  let currentSpeakers: SpeakerRole[] = [];

  for (const line of lines) {
    if (!currentSpeakers.includes(line.role)) {
      if (currentSpeakers.length >= 2) {
        // 3번째 화자 등장 → 현재 그룹 마감, 새 그룹 시작
        groups.push(currentGroup);
        currentGroup = [line];
        currentSpeakers = [line.role];
      } else {
        currentSpeakers.push(line.role);
        currentGroup.push(line);
      }
    } else {
      currentGroup.push(line);
    }
  }
  if (currentGroup.length > 0) groups.push(currentGroup);
  return groups;
}

/**
 * 발화자 목록에서 고유 역할을 추출해 SpeakerVoiceConfig 배열 생성 (최대 2개)
 * 1명만 있으면 다른 역할 하나를 덤으로 추가해 항상 2개를 맞춤
 */
function buildSpeakerConfigs(lines: DialogueLine[]): SpeakerVoiceConfig[] {
  const uniqueRoles = [...new Set(lines.map((l) => l.role))] as SpeakerRole[];
  const allRoles = Object.keys(VOICE_MAP) as SpeakerRole[];

  while (uniqueRoles.length < 2) {
    const extra = allRoles.find((r) => !uniqueRoles.includes(r));
    if (extra) uniqueRoles.push(extra);
    else break;
  }

  return uniqueRoles.slice(0, 2).map((role) => ({
    speaker: role,
    voiceConfig: {
      prebuiltVoiceConfig: { voiceName: VOICE_MAP[role] },
    },
  }));
}

/**
 * 단일 그룹(최대 2명)에 대한 Gemini TTS 호출
 * @returns raw PCM Buffer (Int16, 24kHz, mono)
 */
async function generateTTSGroup(lines: DialogueLine[], apiKey: string): Promise<Buffer> {
  const speakerConfigs = buildSpeakerConfigs(lines);
  const formattedText = lines.map((l) => `${l.role}: ${l.text}`).join('\n');

  const payload = {
    contents: [{ parts: [{ text: formattedText }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: speakerConfigs,
        },
      },
    },
    model: TTS_MODEL,
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Gemini API ${response.status}: ${body}`);
  }

  const result = await response.json();
  const audioData: string | undefined =
    result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  if (!audioData) throw new Error('Gemini 응답에 오디오 데이터가 없습니다.');

  return Buffer.from(audioData, 'base64');
}

/**
 * 여러 PCM Buffer 를 하나로 이어붙임
 */
function concatPcmBuffers(buffers: Buffer[]): Buffer {
  return Buffer.concat(buffers);
}

/**
 * 전체 대화 라인에 대한 TTS 생성 — 항상 1회 API 호출
 *
 * Gemini 멀티스피커는 정확히 2명만 지원하므로,
 * 단계 내 모든 화자를 대표 2명(첫 번째 화자 + 두 번째 화자)으로 매핑하고
 * 텍스트 앞에 "[역할명]" 을 삽입하여 청자가 화자를 구분할 수 있게 함.
 * 이 방식으로 단계당 1회 호출만 사용.
 */
export async function generateTTS(lines: DialogueLine[], apiKey: string): Promise<string> {
  const speakerConfigs = buildSpeakerConfigs(lines);
  const allowedSpeakers = speakerConfigs.map((c) => c.speaker as SpeakerRole);

  // 3번째 이상 화자는 2번째 목소리로 대체, 텍스트에 이름 태그 삽입
  const mappedLines: DialogueLine[] = lines.map((l) => ({
    role: allowedSpeakers.includes(l.role) ? l.role : allowedSpeakers[1],
    text: allowedSpeakers.includes(l.role) ? l.text : `[${l.role}] ${l.text}`,
  }));

  const buf = await generateTTSGroup(mappedLines, apiKey);
  return buf.toString('base64');
}

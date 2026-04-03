// ============================================================
// 빌드 시 Gemini TTS 오디오 사전 생성 스크립트
// GitHub Actions(미국 서버)에서 실행 → 지역 제한 우회
// Usage: GEMINI_API_KEY=xxx node scripts/generate-audio.mjs
// ============================================================
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'public', 'audio', 'lines');

const TTS_MODEL = 'gemini-2.5-flash-preview-tts';
const AUDIO_CACHE_VERSION = 'v1';

const VOICE_MAP = {
  '진행자':    'Charon',
  '드림스타트': 'Leda',
  '아보전':    'Rasalgethi',
  '정신건강':  'Autonoe',
  '보건소':    'Enceladus',
};

const ALL_LINES = [
  // 0단계: 회의 방향 설정
  { role: '진행자',    text: '오늘 회의는 각 기관이 무엇을 할 수 있는지 자랑하는 자리가 아닙니다. 이 학생을 중심으로 하나의 지원 시스템을 만드는 자리입니다. 기관별 지원이 아니라 연결된 지원을 설계하겠습니다.' },
  { role: '드림스타트', text: '초4 남학생으로 부친과 단둘이 거주 중입니다. 방임과 반복적인 폭력에 노출되어 있으며 영양 상태가 매우 불량합니다. 학교에서는 또래와 교사에게 공격적 행동을 보이고 있습니다.' },
  { role: '진행자',    text: '이 학생의 행동 문제는 결과일 뿐입니다. 본질은 환경입니다. 생존의 문제를 해결하지 않고는 어떤 지원도 효과가 없습니다. 단일 기관은 결코 이 문제를 해결할 수 없습니다.' },
  // 1단계: 문제의 본질 규정
  { role: '아보전',    text: '부친의 폭력과 방임이 반복되고 있습니다. 아동이 집에서 혼자 있는 시간이 길고 식사가 제대로 이뤄지지 않고 있습니다.' },
  { role: '정신건강',  text: 'ADHD 및 분노조절 장애가 의심되나 이전 상담 실패로 상담 거부감이 매우 강합니다. 치료 접근 방식을 관계 중심으로 전환해야 합니다.' },
  { role: '보건소',    text: '치아 상태가 불량하고 체격이 왜소합니다. 인스턴트 위주의 식사로 인한 영양 결핍이 심각한 수준으로 즉각적인 건강 개입이 필요합니다.' },
  // 2단계: 필요 지원 파악
  { role: '진행자',    text: '각 기관이 파악한 지원 필요 사항을 점검하겠습니다. 신체 안전, 정서 지원, 일상 돌봄, 건강 치료 네 가지 영역으로 나눠서 확인합니다.' },
  { role: '드림스타트', text: '일상 돌봄과 식사 지원이 가장 시급합니다. 방과 후 혼자 있는 시간이 길기 때문에 안전한 공간과 끼니 지원을 즉시 연결해야 합니다.' },
  { role: '아보전',    text: '가정 내 방임 및 폭력 여부에 대한 공식 조사가 필요합니다. 직권 조사를 통해 아동의 안전 환경을 확인하고 필요 시 보호 조치를 검토하겠습니다.' },
  { role: '정신건강',  text: '이 학생이 유일하게 행복해하는 건 체육 시간과 축구입니다. 이 긍정적 요소를 치료적 접근의 시작점으로 활용하면 상담 거부감을 낮출 수 있습니다.' },
  // 3단계: 기관별 책임 선언
  { role: '아보전',    text: '가정 내 방임 및 폭력 여부를 즉시 조사하고 필요 시 보호 조치를 책임지겠습니다. 아동이 안전한 환경에서 생활할 수 있도록 가정 개입을 지속하겠습니다.' },
  { role: '드림스타트', text: '식사와 일상 돌봄은 저희가 책임지겠습니다. 방과 후 프로그램과 결식 지원을 즉시 연결하겠습니다.' },
  { role: '정신건강',  text: 'ADHD 정밀 평가와 정서 치료를 맡겠습니다. 상담 거부감을 고려해 축구 등 관계 중심 활동에서 시작하여 자연스럽게 접근하겠습니다.' },
  { role: '보건소',    text: '치아 치료와 전반적인 건강 상태 점검을 진행하겠습니다. 영양 상태 개선을 위한 정기 건강 모니터링도 함께 실시하겠습니다.' },
  // 4단계: 통합 사례관리 설계
  { role: '진행자',    text: '각 기관이 따로 움직이면 아이를 또 놓칩니다. 누가 이 지원들을 하나로 연결할 것인지를 정해야 합니다. 통합 사례관리자를 지정하겠습니다.' },
  { role: '드림스타트', text: '저희 드림스타트가 통합 사례관리를 맡겠습니다. 각 기관의 지원 현황을 취합하고 주간 공유 체계를 운영하겠습니다.' },
  { role: '아보전',    text: '저희는 안전 영역을 전담하겠습니다. 가정 방문과 위기 상황 발생 시 즉각 대응 체계를 구축하겠습니다.' },
  { role: '진행자',    text: '학교는 일상 관찰자 역할을 맡아 이상 징후 발견 즉시 드림스타트에 연락합니다. 이 학생이 다시 지원의 사각지대에 놓이는 일이 없도록 하겠습니다.' },
  // 5단계: 모니터링 계획
  { role: '진행자',    text: '2주 후 첫 점검 회의를 진행합니다. 각 기관은 지원 착수 현황과 초기 반응을 공유해 주시기 바랍니다.' },
  { role: '정신건강',  text: '첫 2주는 관계 형성에 집중하겠습니다. 축구를 매개로 한 접촉을 시작하고 정식 평가는 신뢰 형성 후 진행하겠습니다.' },
  { role: '보건소',    text: '1개월 내로 건강 검진과 치아 치료 일정을 잡겠습니다. 학교와 연계하여 학생이 빠지지 않도록 사전 준비를 하겠습니다.' },
  { role: '진행자',    text: '이 학생을 살리는 것은 더 많은 기관이 아니라 더 잘 연결된 기관입니다. 오늘 우리가 설계한 이 연결이 한 아이의 삶을 바꿀 것입니다.' },
];

async function generateAudio(text, voiceName, apiKey) {
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
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Gemini API ${res.status}: ${body}`);
  }

  const result = await res.json();
  const audioData = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audioData) throw new Error('Gemini 응답에 오디오 데이터가 없습니다');
  return audioData;
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) { console.error('GEMINI_API_KEY 환경변수가 없습니다'); process.exit(1); }

  // 이미 완전한 캐시가 있으면 건너뜀
  const manifestPath = join(OUTPUT_DIR, 'manifest.json');
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    if (manifest.version === AUDIO_CACHE_VERSION && manifest.count === ALL_LINES.length) {
      console.log(`오디오 캐시가 이미 존재합니다 (${ALL_LINES.length}개). 건너뜁니다.`);
      return;
    }
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });

  for (let i = 0; i < ALL_LINES.length; i++) {
    const line = ALL_LINES[i];
    const voiceName = VOICE_MAP[line.role];
    console.log(`[${i + 1}/${ALL_LINES.length}] ${line.role} (${voiceName}) 생성 중...`);

    let audioData;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        audioData = await generateAudio(line.text, voiceName, apiKey);
        break;
      } catch (err) {
        console.warn(`  재시도 ${attempt + 1}/3: ${err.message}`);
        if (attempt < 2) await new Promise(r => setTimeout(r, 3000 * (attempt + 1)));
        else throw err;
      }
    }

    const fileName = `line_${String(i).padStart(2, '0')}.b64`;
    writeFileSync(join(OUTPUT_DIR, fileName), audioData, 'utf8');

    // API rate limit 방지
    await new Promise(r => setTimeout(r, 800));
  }

  writeFileSync(
    manifestPath,
    JSON.stringify({ version: AUDIO_CACHE_VERSION, count: ALL_LINES.length }),
    'utf8'
  );

  console.log(`완료! ${ALL_LINES.length}개 오디오 파일 생성됨.`);
}

main().catch(e => { console.error(e); process.exit(1); });

// ============================================================
// 지역기관 통합 사례회의 — 단일 진실 공급원 (상수 / 데이터)
// ============================================================
import type { DialogueLine, MeetingStep, RiskLevels, VoiceName, SpeakerRole } from '@/types/meeting';

// Gemini TTS 모델 (변경 시 여기서만 수정)
export const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

// 발화자 → Gemini 보이스 매핑
export const VOICE_MAP: Record<SpeakerRole, VoiceName> = {
  '진행자':    'Charon',       // 남성 저음 — 권위/진행
  '드림스타트': 'Leda',         // 여성 고음 — 따뜻/돌봄
  '아보전':    'Rasalgethi',   // 남성 중저음 — 강직/단호
  '정신건강':  'Autonoe',      // 여성 중고음 — 지적/치료
  '보건소':    'Enceladus',    // 남성 고음 — 명확/의료
};

// 화면 표시용 보이스 프로필 라벨
export const VOICE_PROFILE_LABELS: Record<SpeakerRole, { desc: string; color: string; bg: string }> = {
  '진행자':    { desc: '남성 저음 (Charon)',       color: 'text-blue-700',    bg: 'bg-blue-50'    },
  '드림스타트': { desc: '여성 고음 (Leda)',          color: 'text-rose-600',    bg: 'bg-rose-50'    },
  '아보전':    { desc: '남성 중저음 (Rasalgethi)', color: 'text-slate-700',   bg: 'bg-slate-100'  },
  '정신건강':  { desc: '여성 중고음 (Autonoe)',    color: 'text-emerald-600', bg: 'bg-emerald-50' },
  '보건소':    { desc: '남성 고음 (Enceladus)',    color: 'text-amber-600',   bg: 'bg-amber-50'   },
};

// 발화자 아바타 색상 (DialogueMessage 컴포넌트에서 사용)
export const ROLE_COLORS: Record<SpeakerRole, string> = {
  '진행자':    'bg-blue-700 text-white border-blue-950 shadow-blue-900/30',
  '드림스타트': 'bg-rose-500 text-white border-rose-900 shadow-rose-900/30',
  '아보전':    'bg-slate-700 text-white border-slate-950 shadow-slate-900/30',
  '정신건강':  'bg-emerald-500 text-white border-emerald-900 shadow-emerald-900/30',
  '보건소':    'bg-amber-500 text-white border-amber-900 shadow-amber-900/30',
};

// 6단계 회의 진행 정보
export const STEPS: MeetingStep[] = [
  { title: '1. 회의 방향 설정',   duration: '10분', goal: '지원 시스템 설계'    },
  { title: '2. 문제의 본질 규정', duration: '10분', goal: '생존 문제 인식'      },
  { title: '3. 필요 지원 파악',   duration: '20분', goal: '분야별 지원 확인'    },
  { title: '4. 기관별 책임 선언', duration: '40분', goal: '책임 분담 결정'      },
  { title: '5. 통합 사례관리',    duration: '25분', goal: '연결 관리자 지정'    },
  { title: '6. 모니터링 계획',    duration: '10분', goal: '정기 점검 계획'      },
];

// 초기 위기 수치
export const INITIAL_RISK_LEVELS: RiskLevels = {
  safety: 72,
  development: 80,
  social: 65,
};

// 단계별 위기 수치 업데이트 맵 (없으면 변경 없음)
export const RISK_UPDATES: Record<number, Partial<RiskLevels>> = {
  1: { safety: 88, development: 82, social: 72 },
  3: { safety: 92, development: 88, social: 78 },
};

// 단계별 대화 데이터 (index = step index)
export const DIALOGUE_DATA: DialogueLine[][] = [
  // 0단계: 회의 방향 설정
  [
    { role: '진행자',    text: '오늘 회의는 각 기관이 무엇을 할 수 있는지 자랑하는 자리가 아닙니다. 이 학생을 중심으로 하나의 지원 시스템을 만드는 자리입니다. 기관별 지원이 아니라 연결된 지원을 설계하겠습니다.' },
    { role: '드림스타트', text: '초4 남학생으로 부친과 단둘이 거주 중입니다. 방임과 반복적인 폭력에 노출되어 있으며 영양 상태가 매우 불량합니다. 학교에서는 또래와 교사에게 공격적 행동을 보이고 있습니다.' },
    { role: '진행자',    text: '이 학생의 행동 문제는 결과일 뿐입니다. 본질은 환경입니다. 생존의 문제를 해결하지 않고는 어떤 지원도 효과가 없습니다. 단일 기관은 결코 이 문제를 해결할 수 없습니다.' },
  ],
  // 1단계: 문제의 본질 규정
  [
    { role: '아보전',    text: '부친의 폭력과 방임이 반복되고 있습니다. 아동이 집에서 혼자 있는 시간이 길고 식사가 제대로 이뤄지지 않고 있습니다.' },
    { role: '정신건강',  text: 'ADHD 및 분노조절 장애가 의심되나 이전 상담 실패로 상담 거부감이 매우 강합니다. 치료 접근 방식을 관계 중심으로 전환해야 합니다.' },
    { role: '보건소',    text: '치아 상태가 불량하고 체격이 왜소합니다. 인스턴트 위주의 식사로 인한 영양 결핍이 심각한 수준으로 즉각적인 건강 개입이 필요합니다.' },
  ],
  // 2단계: 필요 지원 파악
  [
    { role: '진행자',    text: '각 기관이 파악한 지원 필요 사항을 점검하겠습니다. 신체 안전, 정서 지원, 일상 돌봄, 건강 치료 네 가지 영역으로 나눠서 확인합니다.' },
    { role: '드림스타트', text: '일상 돌봄과 식사 지원이 가장 시급합니다. 방과 후 혼자 있는 시간이 길기 때문에 안전한 공간과 끼니 지원을 즉시 연결해야 합니다.' },
    { role: '아보전',    text: '가정 내 방임 및 폭력 여부에 대한 공식 조사가 필요합니다. 직권 조사를 통해 아동의 안전 환경을 확인하고 필요 시 보호 조치를 검토하겠습니다.' },
    { role: '정신건강',  text: '이 학생이 유일하게 행복해하는 건 체육 시간과 축구입니다. 이 긍정적 요소를 치료적 접근의 시작점으로 활용하면 상담 거부감을 낮출 수 있습니다.' },
  ],
  // 3단계: 기관별 책임 선언
  [
    { role: '아보전',    text: '가정 내 방임 및 폭력 여부를 즉시 조사하고 필요 시 보호 조치를 책임지겠습니다. 아동이 안전한 환경에서 생활할 수 있도록 가정 개입을 지속하겠습니다.' },
    { role: '드림스타트', text: '식사와 일상 돌봄은 저희가 책임지겠습니다. 방과 후 프로그램과 결식 지원을 즉시 연결하겠습니다.' },
    { role: '정신건강',  text: 'ADHD 정밀 평가와 정서 치료를 맡겠습니다. 상담 거부감을 고려해 축구 등 관계 중심 활동에서 시작하여 자연스럽게 접근하겠습니다.' },
    { role: '보건소',    text: '치아 치료와 전반적인 건강 상태 점검을 진행하겠습니다. 영양 상태 개선을 위한 정기 건강 모니터링도 함께 실시하겠습니다.' },
  ],
  // 4단계: 통합 사례관리 설계
  [
    { role: '진행자',    text: '각 기관이 따로 움직이면 아이를 또 놓칩니다. 누가 이 지원들을 하나로 연결할 것인지를 정해야 합니다. 통합 사례관리자를 지정하겠습니다.' },
    { role: '드림스타트', text: '저희 드림스타트가 통합 사례관리를 맡겠습니다. 각 기관의 지원 현황을 취합하고 주간 공유 체계를 운영하겠습니다.' },
    { role: '아보전',    text: '저희는 안전 영역을 전담하겠습니다. 가정 방문과 위기 상황 발생 시 즉각 대응 체계를 구축하겠습니다.' },
    { role: '진행자',    text: '학교는 일상 관찰자 역할을 맡아 이상 징후 발견 즉시 드림스타트에 연락합니다. 이 학생이 다시 지원의 사각지대에 놓이는 일이 없도록 하겠습니다.' },
  ],
  // 5단계: 모니터링 계획
  [
    { role: '진행자',    text: '2주 후 첫 점검 회의를 진행합니다. 각 기관은 지원 착수 현황과 초기 반응을 공유해 주시기 바랍니다.' },
    { role: '정신건강',  text: '첫 2주는 관계 형성에 집중하겠습니다. 축구를 매개로 한 접촉을 시작하고 정식 평가는 신뢰 형성 후 진행하겠습니다.' },
    { role: '보건소',    text: '1개월 내로 건강 검진과 치아 치료 일정을 잡겠습니다. 학교와 연계하여 학생이 빠지지 않도록 사전 준비를 하겠습니다.' },
    { role: '진행자',    text: '이 학생을 살리는 것은 더 많은 기관이 아니라 더 잘 연결된 기관입니다. 오늘 우리가 설계한 이 연결이 한 아이의 삶을 바꿀 것입니다.' },
  ],
];

// 최종 의사결정 요약 (step 4 이상에서 표시)
export const DECISION_SUMMARY = [
  { tag: '안전', text: '가정 방임·폭력 조사 및 보호 조치 (아보전)' },
  { tag: '돌봄', text: '식사 지원 및 일상 돌봄 제공 (드림스타트)' },
  { tag: '치료', text: 'ADHD 평가 및 관계 중심 정서 치료 (정신건강)' },
];

// 전체 발언을 단계 정보와 함께 평탄화한 배열 (22개)
export const ALL_LINES: (DialogueLine & { step: number })[] = DIALOGUE_DATA.flatMap(
  (lines, stepIdx) => lines.map(line => ({ ...line, step: stepIdx }))
);

// 캐시 버전 — 대사 변경 시 올릴 것
export const AUDIO_CACHE_VERSION = 'v1';

// ============================================================
// PCM → WAV 변환 유틸리티 (클라이언트 전용)
// sare.html의 pcmToWav() 를 TypeScript 로 이식
// ============================================================

/**
 * 16-bit PCM Int16Array 를 WAV ArrayBuffer 로 변환
 * Gemini TTS 응답은 raw PCM(24kHz, mono, 16-bit) 으로 반환됨
 */
export function pcmToWav(pcmData: Int16Array, sampleRate = 24000): ArrayBuffer {
  const numSamples = pcmData.length;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF header
  writeString(0, 'RIFF');
  view.setUint32(4,  36 + numSamples * 2, true); // chunk size
  writeString(8,  'WAVE');

  // fmt sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16,           true); // sub-chunk size
  view.setUint16(20, 1,            true); // PCM format
  view.setUint16(22, 1,            true); // mono
  view.setUint32(24, sampleRate,   true); // sample rate
  view.setUint32(28, sampleRate * 2, true); // byte rate (sampleRate * blockAlign)
  view.setUint16(32, 2,            true); // block align (1ch * 2byte)
  view.setUint16(34, 16,           true); // bits per sample

  // data sub-chunk
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // PCM 샘플 복사
  new Uint8Array(buffer, 44).set(new Uint8Array(pcmData.buffer));

  return buffer;
}

/**
 * Base64 인코딩된 PCM 데이터를 Audio 객체와 ObjectURL로 변환
 * 호출자가 onended/onerror 설정 후 URL.revokeObjectURL(url) 책임짐
 */
export function base64PcmToAudio(base64: string): { audio: HTMLAudioElement; url: string } {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const pcmData = new Int16Array(bytes.buffer, 0, Math.floor(bytes.length / 2));
  const wavBuffer = pcmToWav(pcmData);
  const blob = new Blob([wavBuffer], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);

  return { audio: new Audio(url), url };
}

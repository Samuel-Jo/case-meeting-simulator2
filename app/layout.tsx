import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '지역기관 통합 사례회의 시뮬레이터',
  description: '지역기관 통합 사례회의 AI 시뮬레이터 — 위기 학생 지원 네트워크',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

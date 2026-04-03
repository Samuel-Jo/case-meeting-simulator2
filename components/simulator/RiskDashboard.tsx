'use client';
import { HeartPulse, Home, ShieldAlert, Users } from 'lucide-react';
import type { RiskLevels } from '@/types/meeting';

interface RiskDashboardProps {
  riskLevels: RiskLevels;
}

export default function RiskDashboard({ riskLevels }: RiskDashboardProps) {
  const indicators = [
    {
      label: '신체 안전성 (방임)',
      value: riskLevels.safety,
      color: 'bg-red-500',
      icon: <Home size={14} />,
    },
    {
      label: '아동 발달권 (영양)',
      value: riskLevels.development,
      color: 'bg-orange-500',
      icon: <HeartPulse size={14} />,
    },
    {
      label: '사회적 적응 (부적응)',
      value: riskLevels.social,
      color: 'bg-amber-500',
      icon: <Users size={14} />,
    },
  ];

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
      {/* 배경 아이콘 */}
      <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12">
        <ShieldAlert size={100} />
      </div>

      <h2 className="font-black text-sm mb-10 flex items-center gap-3 text-red-600">
        <ShieldAlert size={22} /> 실시간 위기 분석 지표
      </h2>

      <div className="space-y-10">
        {indicators.map((risk) => (
          <div key={risk.label} className="space-y-4">
            <div className="flex justify-between items-center text-[11px] font-black text-slate-500">
              <span className="flex items-center gap-2 uppercase tracking-tight">
                {risk.icon} {risk.label}
              </span>
              <span
                className="text-sm font-black"
                style={{ color: risk.value > 80 ? '#ef4444' : '#f97316' }}
              >
                {risk.value}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden p-0.5 border border-slate-100 shadow-inner">
              <div
                className={`h-full transition-all duration-[2s] ease-out rounded-full shadow-lg ${risk.color}`}
                style={{ width: `${risk.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

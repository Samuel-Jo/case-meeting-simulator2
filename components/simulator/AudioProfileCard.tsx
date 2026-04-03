'use client';
import { Headphones } from 'lucide-react';
import { VOICE_PROFILE_LABELS } from '@/lib/constants';
import type { SpeakerRole } from '@/types/meeting';

const ROLES = Object.keys(VOICE_PROFILE_LABELS) as SpeakerRole[];

export default function AudioProfileCard() {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
      <h2 className="font-black text-xs text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
        <Headphones size={16} /> Audio Profile Mapping
      </h2>
      <div className="space-y-4">
        {ROLES.map((role) => {
          const { desc, color, bg } = VOICE_PROFILE_LABELS[role];
          return (
            <div
              key={role}
              className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl transition-transform hover:scale-105"
            >
              <span className="text-xs font-black text-slate-800 tracking-tighter">{role}</span>
              <span className={`text-[9px] font-black ${color} ${bg} px-3 py-1 rounded-full uppercase tracking-tighter`}>
                {desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';
import { XCircle } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onClose: () => void;
}

export default function ErrorBanner({ message, onClose }: ErrorBannerProps) {
  return (
    <div className="max-w-5xl mx-auto mb-4 bg-white border-l-4 border-red-600 p-4 rounded-xl shadow-lg flex items-center justify-between text-red-700 animate-in slide-in-from-top-2">
      <div className="flex items-center gap-3">
        <XCircle className="text-red-600" size={24} />
        <p className="text-sm font-bold">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 font-bold px-3 py-1 hover:bg-slate-50 rounded"
      >
        닫기
      </button>
    </div>
  );
}

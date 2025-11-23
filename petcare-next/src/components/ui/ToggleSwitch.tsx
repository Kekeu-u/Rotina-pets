'use client';

import { Sun, Moon, Stars } from 'lucide-react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  variant?: 'default' | 'theme';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export default function ToggleSwitch({
  checked,
  onChange,
  variant = 'default',
  size = 'md',
  label,
}: ToggleSwitchProps) {
  const sizes = {
    sm: { track: 'w-10 h-5', thumb: 'w-4 h-4', translate: 'translate-x-5', icon: 'w-2.5 h-2.5' },
    md: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'translate-x-7', icon: 'w-3.5 h-3.5' },
    lg: { track: 'w-16 h-8', thumb: 'w-7 h-7', translate: 'translate-x-8', icon: 'w-4 h-4' },
  };

  const s = sizes[size];

  if (variant === 'theme') {
    return (
      <div className="flex items-center gap-3">
        {label && <span className="text-sm font-medium">{label}</span>}
        <button
          onClick={onChange}
          className={`theme-toggle-track ${s.track} relative rounded-full p-0.5 transition-all duration-500 ${
            checked
              ? 'bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-950 shadow-[inset_0_2px_10px_rgba(0,0,0,0.4),0_0_20px_rgba(99,102,241,0.3)]'
              : 'bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-400 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_0_20px_rgba(56,189,248,0.4)]'
          }`}
          aria-label={checked ? 'Ativar modo claro' : 'Ativar modo escuro'}
        >
          {/* Stars animation for dark mode */}
          <div className={`absolute inset-0 overflow-hidden rounded-full transition-opacity duration-500 ${checked ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute top-1 left-2 w-1 h-1 bg-white rounded-full animate-twinkle" style={{ animationDelay: '0ms' }}></div>
            <div className="absolute top-3 left-4 w-0.5 h-0.5 bg-white/70 rounded-full animate-twinkle" style={{ animationDelay: '300ms' }}></div>
            <div className="absolute bottom-2 left-3 w-0.5 h-0.5 bg-white/50 rounded-full animate-twinkle" style={{ animationDelay: '600ms' }}></div>
          </div>

          {/* Clouds animation for light mode */}
          <div className={`absolute inset-0 overflow-hidden rounded-full transition-opacity duration-500 ${!checked ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute top-1 left-2 w-2 h-1 bg-white/60 rounded-full animate-cloud-float" style={{ animationDelay: '0ms' }}></div>
            <div className="absolute bottom-1.5 left-4 w-1.5 h-0.5 bg-white/40 rounded-full animate-cloud-float" style={{ animationDelay: '500ms' }}></div>
          </div>

          {/* Thumb */}
          <div
            className={`${s.thumb} rounded-full transition-all duration-500 flex items-center justify-center relative ${
              checked
                ? `${s.translate} bg-gradient-to-br from-slate-200 via-gray-100 to-slate-300 shadow-[0_0_15px_rgba(255,255,255,0.5),inset_0_-2px_4px_rgba(0,0,0,0.1)]`
                : 'translate-x-0 bg-gradient-to-br from-yellow-300 via-orange-300 to-yellow-400 shadow-[0_0_20px_rgba(251,191,36,0.8),inset_0_-2px_4px_rgba(0,0,0,0.1)]'
            }`}
          >
            {checked ? (
              <>
                {/* Moon face */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Moon className={`${s.icon} text-slate-500`} />
                </div>
                {/* Moon craters */}
                <div className="absolute top-1 right-1.5 w-1 h-1 bg-slate-400/30 rounded-full"></div>
                <div className="absolute bottom-1.5 left-1 w-0.5 h-0.5 bg-slate-400/20 rounded-full"></div>
              </>
            ) : (
              <>
                {/* Sun face */}
                <Sun className={`${s.icon} text-orange-600`} />
                {/* Sun rays */}
                <div className="absolute inset-0 animate-spin-slow" style={{ animationDuration: '8s' }}>
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-0.5 h-1 bg-yellow-500/50 rounded-full left-1/2 -translate-x-1/2"
                      style={{
                        top: '-2px',
                        transform: `rotate(${i * 45}deg) translateY(-100%)`,
                        transformOrigin: 'center 150%',
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </button>
      </div>
    );
  }

  // Default toggle
  return (
    <div className="flex items-center gap-3">
      {label && <span className="text-sm font-medium">{label}</span>}
      <button
        onClick={onChange}
        className={`${s.track} relative rounded-full p-0.5 transition-all duration-300 ${
          checked
            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30'
            : 'bg-gray-600/50'
        }`}
        aria-label={checked ? 'Desativar' : 'Ativar'}
      >
        <div
          className={`${s.thumb} rounded-full transition-all duration-300 ${
            checked
              ? `${s.translate} bg-white shadow-lg`
              : 'translate-x-0 bg-gray-300'
          }`}
        />
      </button>
    </div>
  );
}

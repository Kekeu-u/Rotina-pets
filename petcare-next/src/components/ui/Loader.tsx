'use client';

// Premium Loaders inspired by uiverse.io

interface LoaderProps {
  variant?: 'paw' | 'pulse' | 'dots' | 'orbit';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export default function Loader({ variant = 'paw', size = 'md', text }: LoaderProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {variant === 'paw' && (
        <div className={`loader-paw ${sizeClasses[size]}`}>
          <div className="paw-print">
            <span className="pad pad-1"></span>
            <span className="pad pad-2"></span>
            <span className="pad pad-3"></span>
            <span className="pad pad-4"></span>
            <span className="pad pad-main"></span>
          </div>
        </div>
      )}

      {variant === 'pulse' && (
        <div className={`loader-pulse ${sizeClasses[size]}`}>
          <div className="pulse-ring"></div>
          <div className="pulse-ring"></div>
          <div className="pulse-ring"></div>
          <div className="pulse-core"></div>
        </div>
      )}

      {variant === 'dots' && (
        <div className="loader-dots flex gap-1.5">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      )}

      {variant === 'orbit' && (
        <div className={`loader-orbit ${sizeClasses[size]}`}>
          <div className="orbit-track"></div>
          <div className="orbit-planet"></div>
        </div>
      )}

      {text && (
        <span className={`text-gray-400 ${textSizes[size]} animate-pulse`}>
          {text}
        </span>
      )}
    </div>
  );
}

// Inline loader for buttons
export function InlineLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-loader ${className}`}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
}

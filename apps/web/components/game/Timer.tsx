'use client';

import clsx from 'clsx';

interface TimerProps {
  seconds: number;
  teamColor: string;
  maxSeconds?: number;
}

export default function Timer({ seconds, teamColor, maxSeconds = 80 }: TimerProps) {
  const progress = (seconds / maxSeconds) * 100;
  const isLow = seconds <= 10;
  const isCritical = seconds <= 5;

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-20 h-20">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={isCritical ? '#ef4444' : isLow ? '#f59e0b' : teamColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className={clsx(
          "text-2xl font-bold",
          isCritical ? "text-red-400 animate-pulse" : isLow ? "text-yellow-400" : "text-white"
        )}>
          {seconds}
        </span>
      </div>
    </div>
  );
}

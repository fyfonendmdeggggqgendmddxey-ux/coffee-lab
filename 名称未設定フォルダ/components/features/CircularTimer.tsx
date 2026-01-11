"use client";

import React from 'react';

interface CircularTimerProps {
    totalSeconds: number; // For digital display (X:XX)
    stepProgress: number; // 0 to 1 (current step progress)
    currentStepName: string;
    currentStepVolume: number; // e.g. 150ml (cumulative target)
    stepAddedVolume: number; // e.g. 50ml (amount for this step)
    stepIndex: number; // For forcing generic reset
    isFinished?: boolean;
    grinderSetting?: string; // e.g. "(C40: 22)"
}

export default function CircularTimer({
    totalSeconds,
    stepProgress,
    currentStepName,
    currentStepVolume,
    stepAddedVolume,
    stepIndex,
    isFinished,
    grinderSetting
}: CircularTimerProps) {
    const radius = 140;
    const stroke = 4;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (stepProgress * circumference);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return (
            <>
                <span className="text-8xl font-bold tracking-tighter text-white">
                    {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
                </span>
            </>
        );
    };

    return (
        <div className="relative flex items-center justify-center w-[320px] h-[320px]">
            {/* SVG Ring Container */}
            <svg
                height={radius * 2}
                width={radius * 2}
                className="rotate-[-90deg] overflow-visible"
            >
                {/* Background Ring */}
                <circle
                    stroke="#222"
                    strokeWidth={stroke}
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />

                {/* Progress Ring (Glowing) */}
                <circle
                    key={stepIndex} // Force re-mount on step change to eliminate transition lag
                    stroke="white"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    style={{
                        strokeDasharray: circumference + ' ' + circumference,
                        strokeDashoffset,
                        transition: stepProgress === 0 ? 'none' : 'stroke-dashoffset 0.1s linear',
                        filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))'
                    }}
                />

                {/* Outer Ticks (Decoration) */}
                {[...Array(60)].map((_, i) => {
                    const angle = (i * 6) * (Math.PI / 180);
                    const r1 = radius + 10;
                    const r2 = radius + 15;
                    const x1 = radius + r1 * Math.cos(angle);
                    const y1 = radius + r1 * Math.sin(angle);
                    const x2 = radius + r2 * Math.cos(angle);
                    const y2 = radius + r2 * Math.sin(angle);
                    return (
                        <line
                            key={i}
                            x1={x1} y1={y1}
                            x2={x2} y2={y2}
                            stroke={i % 5 === 0 ? "#666" : "#333"}
                            strokeWidth={i % 5 === 0 ? 2 : 1}
                        />
                    );
                })}


            </svg>

            {/* Central Information */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 select-none">
                <div className="flex items-baseline">
                    {formatTime(totalSeconds)}
                </div>

                <div className="flex flex-col items-center mt-2 space-y-1">
                    <span className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold">
                        {isFinished ? 'COMPLETE' : currentStepName}
                    </span>
                    <span className="text-sm font-mono text-white border-b border-gray-700 pb-0.5">
                        Target: {Math.round(currentStepVolume)}ml
                        {!isFinished && (
                            <span className="text-gray-500 ml-1">
                                (+{Math.round(stepAddedVolume)}ml)
                            </span>
                        )}
                    </span>
                    {grinderSetting && !isFinished && (
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">
                            {grinderSetting}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

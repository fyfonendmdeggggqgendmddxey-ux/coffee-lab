"use client";

import { useEffect, useState } from 'react';
import { Recipe } from '@/utils/types';

interface AnalogTimerProps {
    totalSeconds: number; // Total brew duration so far
    stepSeconds: number; // Current step duration so far
    currentStepDuration: number; // Target duration for current step
    isRunning: boolean;
    totalWater: number;
}

export default function AnalogTimer({
    totalSeconds,
    stepSeconds,
    currentStepDuration,
    isRunning,
    totalWater
}: AnalogTimerProps) {

    // Calculate angles
    const totalRotation = (totalSeconds % 60) * 6; // 6 degrees per second
    // Step countdown: starts at full circle, reduces
    const stepProgress = Math.min(stepSeconds / currentStepDuration, 1);
    const stepRotation = stepProgress * 360;

    return (
        <div className="relative w-[320px] h-[320px] flex items-center justify-center select-none">
            {/* Outer Ring (Total Time Minutes) */}
            <div className="absolute inset-0 border border-gray-800 rounded-full opacity-30"></div>

            {/* Ticks */}
            {[...Array(60)].map((_, i) => (
                <div
                    key={i}
                    className={`absolute w-[1px] bg-gray-600 origin-bottom left-1/2 top-0 h-full pt-2 ${i % 5 === 0 ? 'h-3 bg-white' : 'h-1 opacity-50'}`}
                    style={{ transform: `translateX(-50%) rotate(${i * 6}deg)` }}
                >
                    <div className={`w-[1px] ${i % 5 === 0 ? 'h-2 bg-white' : 'h-1 bg-gray-600'}`}></div>
                </div>
            ))}

            {/* Step Timer Arc (Countdown visual) */}
            {/* SVG Arc would be better for countdown, let's stick to hands for "Chronograph" feel first */}

            {/* Main Hand (Step Timer - Seconds) - Counts UP for now to match flow, or DOWN? 
                User requested "Step Timer (Count-down)". 
                Let's make a thinner hand for Step.
            */}
            <div
                className="absolute top-0 left-1/2 w-[2px] h-1/2 bg-white origin-bottom transition-transform duration-100 ease-linear z-10"
                style={{
                    transform: `translateX(-50%) rotate(${stepSeconds * (360 / currentStepDuration)}deg)`,
                    height: '45%',
                    backgroundColor: '#fff'
                }}
            >
                {/* Hand Tail */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[4px] h-[20px] bg-white"></div>
            </div>

            {/* Secondary Hand (Total Time) - Minimal indicator */}
            <div
                className="absolute top-0 left-1/2 w-[4px] h-1/2 bg-gray-500 origin-bottom transition-transform duration-100 ease-linear z-0"
                style={{
                    transform: `translateX(-50%) rotate(${totalSeconds * 6}deg)`,
                    height: '35%'
                }}
            ></div>

            {/* Center Cap */}
            <div className="absolute w-3 h-3 bg-white rounded-full z-20 border-2 border-black"></div>

            {/* Digital Readout (embedded) */}
            <div className="absolute bottom-16 flex flex-col items-center">
                <span className="text-4xl font-mono font-bold tracking-tighter tabular-nums text-white">
                    {(totalWater).toFixed(1)}<span className="text-sm text-gray-500 font-light ml-1">g</span>
                </span>
                <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-1">Target Weight</span>
            </div>
        </div>
    );
}

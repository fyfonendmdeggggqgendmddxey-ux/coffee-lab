"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Recipe, DEFAULT_RECIPE } from '@/utils/types';
import CircularTimer from './CircularTimer';
import { usePrecisionTimer } from '@/hooks/usePrecisionTimer';
import { getGrinderClicks } from '@/utils/grinder-table';

interface TimerProps {
  recipe?: Recipe;
  onEdit?: () => void;
}

export default function Timer({ recipe = DEFAULT_RECIPE, onEdit }: TimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Derived Values
  const totalWater = recipe.beanWeight * recipe.ratio;

  // Calculate cumulative time thresholds for each step
  const stepThresholds = useMemo(() => {
    let acc = 0;
    return recipe.steps.map(step => {
      acc += step.duration;
      return acc;
    });
  }, [recipe.steps]);

  // Precision Timer Hook
  const { elapsedTime, reset } = usePrecisionTimer(isRunning);
  const elapsedSeconds = elapsedTime / 1000;

  // Auto-Advance Logic
  useEffect(() => {
    if (!isRunning || isFinished) return;

    // Find current step based on elapsed time vs thresholds
    // If elapsedSeconds > totalDuration, we are finished
    if (elapsedSeconds >= stepThresholds[stepThresholds.length - 1]) {
      setIsFinished(true);
      setIsRunning(false);
      setCurrentStepIndex(recipe.steps.length - 1);
      return;
    }

    // Determine current step index
    const newIndex = stepThresholds.findIndex(threshold => elapsedSeconds < threshold);
    if (newIndex !== -1 && newIndex !== currentStepIndex) {
      setCurrentStepIndex(newIndex);
    }
  }, [elapsedSeconds, stepThresholds, isRunning, isFinished, currentStepIndex, recipe.steps.length]);


  // Current Context Calculation
  const currentStep = recipe.steps[currentStepIndex];

  // Progress within current step
  const previousThreshold = currentStepIndex > 0 ? stepThresholds[currentStepIndex - 1] : 0;
  const currentStepDuration = currentStep.duration;
  const timeInStep = Math.max(0, elapsedSeconds - previousThreshold);
  const stepProgress = Math.min(timeInStep / currentStepDuration, 1);
  // Ensure we consistently show 100% when finished or past this step in other contexts


  // Cumulative Target Volume Logic
  const cumulativeTargetVolume = useMemo(() => {
    return recipe.steps
      .slice(0, currentStepIndex + 1)
      .reduce((acc, step) => acc + (totalWater * (step.waterPercentage / 100)), 0);
  }, [recipe.steps, currentStepIndex, totalWater]);


  // Keyboard Interaction
  // Reset timer when recipe changes significantly (e.g. different bean)
  // We use a ref to track the last recipe ID to avoid resetting on minor re-renders if the object reference changes but it's the same recipe
  const lastRecipeId = useRef(recipe.steps.map(s => s.id).join(','));

  useEffect(() => {
    const currentRecipeId = recipe.steps.map(s => s.id).join(',');
    if (currentRecipeId !== lastRecipeId.current) {
      setIsRunning(false);
      setIsFinished(false);
      setCurrentStepIndex(0);
      reset();
      lastRecipeId.current = currentRecipeId;
    }
  }, [recipe, reset]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (isFinished) return;
      setIsRunning(prev => !prev);
    }
    if (e.code === 'Escape') {
      setIsRunning(false);
      setIsFinished(false);
      reset();
      setCurrentStepIndex(0);
    }
  }, [isFinished, reset]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col items-center justify-center w-full relative h-full">
      {/* Edit Trigger */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={onEdit}
          className="text-[10px] uppercase tracking-widest text-gray-600 hover:text-white border border-transparent hover:border-gray-800 px-2 py-1 transition-all"
        >
          [Edit Recipe]
        </button>
      </div>

      {/* Circular UI */}
      <div className="mb-10 scale-110">
        <CircularTimer
          totalSeconds={elapsedSeconds}
          stepProgress={isFinished ? 1 : stepProgress}
          currentStepName={currentStep.name}
          currentStepVolume={cumulativeTargetVolume}
          stepAddedVolume={totalWater * (currentStep.waterPercentage / 100)}
          stepIndex={currentStepIndex}
          isFinished={isFinished}
          grinderSetting={recipe.grinderModel ? `(${recipe.grinderModel}: ${recipe.grindSize})` : undefined}
        />
      </div>

      {/* Grind Info (New Phase 3) */}
      <div className="absolute top-10 left-10 hidden md:block opacity-60">
        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Grind Setting</div>
        <div className="text-xs text-white border-l-2 border-white pl-2">
          {recipe.grinderModel || "Generic"} <span className="text-gray-400 mx-1">•</span> {recipe.grindSize}
        </div>
      </div>

      {/* Steps Visualization (Mini Timeline) */}
      <div className="flex gap-1 w-full max-w-[400px] h-1 bg-gray-900 rounded-full overflow-hidden mb-8">
        {recipe.steps.map((step, idx) => {
          const isPast = idx < currentStepIndex;
          const isFuture = idx > currentStepIndex;
          const isActive = idx === currentStepIndex;

          let width = '0%';
          if (isPast || isFinished) width = '100%';
          else if (isFuture) width = '0%';
          else if (isActive) width = `${stepProgress * 100}%`;

          return (
            <div key={step.id} className="h-full flex-1 bg-gray-800 relative">
              <div
                className={`absolute left-0 top-0 h-full ${isActive ? 'bg-white' : 'bg-gray-600'}`}
                style={{ width }}
              />
            </div>
          )
        })}
      </div>

      {/* Bottom Panel */}
      <div className="flex gap-12 text-sm uppercase tracking-widest text-gray-500 border-t border-gray-900 pt-6">
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-gray-600 mb-1">Ratio</span>
          <span className="font-mono text-white">1:{recipe.ratio}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-gray-600 mb-1">Total Water</span>
          <span className="font-mono text-white">{totalWater}ml</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-gray-600 mb-1">Temp</span>
          <span className="font-mono text-white">{recipe.temperature}°C</span>
        </div>
      </div>

      {/* iPad / Touch Controls */}
      <div className="flex gap-6 mt-10 items-center z-30">
        <button
          onClick={() => {
            setIsRunning(false);
            setIsFinished(false);
            reset();
            setCurrentStepIndex(0);
          }}
          className="h-14 px-8 text-xs uppercase tracking-widest text-gray-500 border border-gray-800 hover:border-red-500 hover:text-red-500 transition-all active:scale-95"
          aria-label="Reset Timer"
        >
          Reset
        </button>

        <button
          onClick={() => {
            if (!isFinished) setIsRunning(prev => !prev);
          }}
          className={`h-16 px-10 text-sm uppercase tracking-widest font-bold border transition-all active:scale-95 ${isRunning
              ? "border-white text-white hover:bg-white/10"
              : "bg-white text-black border-white hover:bg-gray-200"
            }`}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
      </div>

      <div className="mt-6 text-[9px] text-gray-800 uppercase tracking-widest opacity-50">
        Space: Toggle • Esc: Reset
      </div>

    </div>
  );
}

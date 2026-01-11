"use client";

import { useState, useEffect } from 'react';
import { Recipe, RecipeStep } from '@/utils/types';
import { GRINDER_TABLE } from '@/utils/grinder-table';

interface RecipeEditorProps {
    initialRecipe: Recipe;
    onSave: (recipe: Recipe, scope: 'default' | 'bean') => void;
    onCancel: () => void;
}

export default function RecipeEditor({ initialRecipe, onSave, onCancel }: RecipeEditorProps) {
    const [recipe, setRecipe] = useState<Recipe>(initialRecipe);
    const totalWater = recipe.beanWeight * recipe.ratio;

    // Auto-scaling logic happens naturally by deriving state, 
    // but if we needed to adjust step percentages to maintain volumes, 
    // we would do it here. For now, percentages stay fixed, so water volume scales automatically.

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                // Default to saving for bean for quick save
                onSave(recipe, 'bean');
            }
            if (e.key === 'Escape') {
                onCancel();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [recipe, onSave, onCancel]);

    const updateStep = (id: string, field: keyof RecipeStep, value: string | number) => {
        setRecipe(prev => ({
            ...prev,
            steps: prev.steps.map(s => s.id === id ? { ...s, [field]: value } : s)
        }));
    };

    const addStep = () => {
        const newStep: RecipeStep = {
            id: Date.now().toString(),
            name: 'New Step',
            waterPercentage: 0,
            duration: 30
        };
        setRecipe(prev => ({ ...prev, steps: [...prev.steps, newStep] }));
    };

    const removeStep = (id: string) => {
        setRecipe(prev => ({ ...prev, steps: prev.steps.filter(s => s.id !== id) }));
    };

    const totalPercentage = recipe.steps.reduce((sum, s) => sum + Number(s.waterPercentage), 0);
    const isValid = totalPercentage === 100;

    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-12 bg-black font-mono relative overflow-y-auto">
            <h2 className="text-white uppercase tracking-[0.3em] mb-12 border-b border-gray-800 pb-4 w-full text-center">
                Recipe Configuration
            </h2>

            {/* Recipe Name */}
            <div className="w-full max-w-4xl mb-8 -mt-2">
                <div className="flex flex-col">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Recipe Name (Optional)</label>
                    <input
                        type="text"
                        value={recipe.name || ""}
                        onChange={(e) => setRecipe({ ...recipe, name: e.target.value })}
                        placeholder={initialRecipe.name || "e.g. My Favorite V60"}
                        className="bg-transparent border-b border-gray-800 text-white font-mono focus:outline-none focus:border-white transition-colors w-full text-sm py-2"
                    />
                </div>
            </div>

            {/* Core Variables */}
            <div className="grid grid-cols-4 gap-12 w-full max-w-4xl mb-12">
                {[
                    { label: 'Bean (g)', key: 'beanWeight', val: recipe.beanWeight },
                    { label: 'Ratio (1:x)', key: 'ratio', val: recipe.ratio },
                    { label: 'Temp (°C)', key: 'temperature', val: recipe.temperature },
                    { label: 'Total (ml)', key: 'total', val: totalWater, readOnly: true },
                ].map((item) => (
                    <div key={item.label} className="flex flex-col">
                        <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">{item.label}</label>
                        <input
                            type="number"
                            value={item.val}
                            readOnly={item.readOnly}
                            onChange={(e) => setRecipe({ ...recipe, [item.key as any]: Number(e.target.value) })}
                            className={`bg-transparent text-3xl font-light text-white border-b border-gray-800 focus:border-white focus:outline-none transition-colors py-2 ${item.readOnly ? 'text-gray-500' : ''}`}
                        />
                    </div>
                ))}
            </div>

            {/* Grind Settings */}
            <div className="grid grid-cols-2 gap-12 w-full max-w-4xl mb-12">
                <div className="flex flex-col">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Dripper</label>
                    <div className="relative">
                        <input
                            list="dripper-options"
                            value={recipe.dripper || ""}
                            onChange={(e) => setRecipe({ ...recipe, dripper: e.target.value })}
                            placeholder="e.g. V60"
                            className="bg-black border-b border-gray-800 text-white font-mono focus:outline-none focus:border-white transition-colors w-full text-xs py-2"
                        />
                        <datalist id="dripper-options">
                            <option value="Hario V60" />
                            <option value="Kalita Wave" />
                            <option value="Origami" />
                            <option value="Hario Switch" />
                            <option value="Aeropress" />
                            <option value="Chemex" />
                            <option value="French Press" />
                        </datalist>
                    </div>
                </div>
                <div className="flex flex-col">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Grinder Model</label>
                    <select
                        value={recipe.grinderModel || "S3"}
                        onChange={(e) => setRecipe({ ...recipe, grinderModel: e.target.value })}
                        className="bg-black border-b border-gray-800 text-white font-mono focus:outline-none focus:border-white transition-colors w-full text-xs py-2 appearance-none"
                    >
                        {Object.keys(GRINDER_TABLE.models).map(model => (
                            <option key={model} value={model}>{model}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Clicks / Setting</label>
                    <input
                        type="number"
                        value={recipe.grindSize}
                        onChange={(e) => setRecipe({ ...recipe, grindSize: e.target.value })}
                        className="bg-transparent border-b border-gray-800 text-white font-mono focus:outline-none focus:border-white transition-colors w-full text-xs py-2"
                    />
                </div>
            </div>

            {/* Steps Table */}
            <div className="w-full max-w-4xl">
                <div className="flex justify-between items-end mb-4">
                    <h3 className="text-xs text-gray-500 uppercase tracking-widest">Steps Partitioning</h3>
                    <span className={`text-xs ${isValid ? 'text-gray-500' : 'text-red-500'}`}>
                        Total: {totalPercentage}%
                    </span>
                </div>

                <div className="w-full border-t border-gray-800">
                    {recipe.steps.map((step, idx) => (
                        <div key={step.id} className="flex items-center gap-4 py-3 border-b border-gray-900 group">
                            <span className="text-gray-600 w-6 text-xs">{idx + 1}</span>
                            <input
                                value={step.name}
                                onChange={(e) => updateStep(step.id, 'name', e.target.value)}
                                className="bg-transparent text-white text-sm focus:outline-none flex-1"
                                placeholder="Step Name"
                            />
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={step.waterPercentage}
                                    onChange={(e) => updateStep(step.id, 'waterPercentage', Number(e.target.value))}
                                    className="bg-transparent text-white text-sm text-right w-12 focus:outline-none border-b border-transparent focus:border-gray-700"
                                />
                                <span className="text-gray-600 text-xs">%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 text-sm tabular-nums w-12 text-right">
                                    {(totalWater * (step.waterPercentage / 100)).toFixed(0)}ml
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={step.duration}
                                    onChange={(e) => updateStep(step.id, 'duration', Number(e.target.value))}
                                    className="bg-transparent text-white text-sm text-right w-12 focus:outline-none border-b border-transparent focus:border-gray-700"
                                />
                                <span className="text-gray-600 text-xs">s</span>
                            </div>
                            <button
                                onClick={() => removeStep(step.id)}
                                className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-500 transition-all text-xs px-2"
                            >
                                [x]
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    onClick={addStep}
                    className="mt-4 text-xs text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
                >
                    + Add Step
                </button>
            </div>

            {/* Actions */}
            <div className="absolute bottom-12 flex gap-6">
                <button
                    onClick={onCancel}
                    className="text-xs uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                >
                    Cancel (Esc)
                </button>
                <div className="flex gap-4">
                    <button
                        onClick={() => onSave(recipe, 'bean')}
                        disabled={!isValid}
                        className={`px-8 py-3 border text-xs uppercase tracking-[0.2em] transition-all ${isValid ? 'border-white text-white hover:bg-white hover:text-black' : 'border-gray-800 text-gray-700 cursor-not-allowed'
                            }`}
                    >
                        Save as New
                    </button>
                </div>
            </div>
        </div>
    );
}

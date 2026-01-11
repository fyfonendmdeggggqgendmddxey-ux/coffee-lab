import { Bean, Recipe } from '@/utils/types';
import { getAgingAdjustments } from '@/utils/coffee-math';
import { GRINDER_TABLE } from '@/utils/grinder-table';

interface AICoachProps {
    bean?: Bean;
    recipe?: Recipe;
}

export default function AICoach({ bean, recipe }: AICoachProps) {
    const adjustments = bean
        ? getAgingAdjustments(new Date(bean.roastDate), bean.roastLevel)
        : null;

    return (
        <div className="h-full flex flex-col p-6 font-mono border-l border-gray-900 overflow-y-auto">
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase mb-8 text-gray-500 border-b border-gray-900 pb-2">
                AI Insights
            </h2>

            {bean && adjustments ? (
                <div className="space-y-8">
                    <div className="border-l border-white pl-4 py-1 relative">
                        <div className="absolute -left-[1px] top-0 w-[1px] h-4 bg-white"></div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Analysis Status</p>
                        <p className="text-sm text-gray-300">
                            TARGET: <span className="text-white font-bold">{bean.name}</span>
                        </p>
                        <p className="text-[10px] text-gray-500 mt-2">
                            ROASTED: {bean.roastDate.split('T')[0]} ({Math.floor((Date.now() - new Date(bean.roastDate).getTime()) / (1000 * 60 * 60 * 24))} Days Ago)
                        </p>
                        <div className="mt-4 p-3 border border-gray-900 bg-gray-900/20 text-xs text-gray-400 leading-relaxed font-sans">
                            <span className="text-white block mb-1 uppercase tracking-wider text-[10px] font-mono">[COACH ADVICE]</span>
                            {adjustments.advice}
                        </div>
                    </div>

                    <div className="border-l border-gray-800 pl-4 py-1">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Variable Adjustments</p>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <span className="text-gray-600 block">BLOOM</span>
                                <span className="text-white text-lg">
                                    {adjustments.bloomTimeAdjustment > 0 ? '+' : ''}{adjustments.bloomTimeAdjustment}s
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600 block">TEMP</span>
                                <span className="text-white text-lg">
                                    {adjustments.tempAdjustment > 0 ? '+' : ''}{adjustments.tempAdjustment}°C
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-xs text-gray-600 uppercase tracking-widest text-center mt-20 mb-20">
                    AWAITING BEAN SELECTION
                    <br />
                    <span className="text-[10px] opacity-30">...</span>
                </div>
            )}

            {/* Grinder Conversion Table */}
            {recipe && recipe.grinderModel && recipe.grindSize && (
                <div className="mt-8 border-t border-gray-900 pt-8 pb-8">
                    <h2 className="text-xs font-bold tracking-[0.2em] uppercase mb-4 text-gray-500">
                        Universal Grind
                    </h2>
                    <div className="text-[10px] text-gray-400 mb-4 bg-gray-900/30 p-2 rounded">
                        Current: <span className="text-white font-bold">{recipe.grinderModel}</span> @ <span className="text-white font-bold">{recipe.grindSize}</span>
                    </div>

                    <div className="bg-gray-900/10 p-4 border-l border-gray-800">
                        {(() => {
                            const currentClicks = Number(recipe.grindSize);
                            if (isNaN(currentClicks)) return <div className="text-gray-600 text-xs">Invalid Clicks</div>;

                            const currentModelData = GRINDER_TABLE.models[recipe.grinderModel as keyof typeof GRINDER_TABLE.models];
                            if (!currentModelData) return <div className="text-gray-600 text-xs">Unknown Model Data</div>;

                            // Find closest index
                            let closestIndex = -1;
                            let minDiff = Infinity;
                            currentModelData.forEach((val, idx) => {
                                if (val === null) return;
                                const diff = Math.abs(val - currentClicks);
                                if (diff < minDiff) {
                                    minDiff = diff;
                                    closestIndex = idx;
                                }
                            });

                            if (closestIndex === -1) return <div className="text-gray-600 text-xs">Out of Range</div>;

                            return (
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    {Object.entries(GRINDER_TABLE.models).map(([model, clicks]) => {
                                        if (model === recipe.grinderModel) return null;
                                        const val = clicks[closestIndex];
                                        return (
                                            <div key={model} className="flex justify-between items-center border-b border-gray-900/30 pb-1">
                                                <span className="text-[9px] text-gray-500 uppercase tracking-wider truncate mr-2">{model.replace(/_/g, ' ')}</span>
                                                <span className="text-xs text-white font-mono">{val !== null ? val : '-'}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
}

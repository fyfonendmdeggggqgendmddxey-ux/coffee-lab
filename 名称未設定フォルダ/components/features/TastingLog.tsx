"use client";

import { useState, useEffect } from 'react';
import { Bean } from '@/utils/types';

type TastingLog = {
    id: string;
    beanId?: string;
    rating: number; // 1-5
    notes: string;
    date: string;
};

interface TastingLogProps {
    bean?: Bean;
}

export default function TastingLog({ bean }: TastingLogProps) {
    const [rating, setRating] = useState(0);
    const [notes, setNotes] = useState('');
    const [saved, setSaved] = useState(false);

    // Load logs on mount
    const [history, setHistory] = useState<TastingLog[]>([]);

    useEffect(() => {
        const savedLogs = localStorage.getItem('kugcc_logs');
        if (savedLogs) {
            setHistory(JSON.parse(savedLogs));
        }
    }, []);

    const filteredHistory = history.filter(log => !bean || log.beanId === bean.id);

    const handleSave = () => {
        if (!bean) {
            alert("Select a bean to link this log.");
            return;
        }
        if (rating === 0) {
            alert("Please rate the brew.");
            return;
        }
        const newLog: TastingLog = {
            id: Date.now().toString(),
            beanId: bean.id,
            rating,
            notes,
            date: new Date().toISOString()
        };

        const updatedHistory = [newLog, ...history];
        setHistory(updatedHistory);
        localStorage.setItem('kugcc_logs', JSON.stringify(updatedHistory));

        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            setRating(0);
            setNotes('');
        }, 2000);
    };

    return (
        <div className="h-full flex flex-col p-6 font-mono">
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase mb-8 text-gray-500 border-b border-gray-900 pb-2 flex justify-between">
                <span>Tasting Log</span>
                <span className="text-gray-700">{filteredHistory.length} ENTRIES</span>
            </h2>

            {!bean ? (
                <div className="text-xs text-gray-600 uppercase tracking-widest text-center mt-20">
                    AWAITING BEAN SELECTION
                    <br />
                    <span className="text-[10px] opacity-30">Select a bean to view or add logs</span>
                </div>
            ) : (
                <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {/* Input Area */}
                    <div className="border-b border-gray-800 pb-8 mb-8">
                        <div className="mb-6">
                            <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">
                                Quality Index
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => setRating(val)}
                                        className={`w-8 h-8 md:w-10 md:h-2 border transition-all duration-300 ${rating >= val
                                            ? 'bg-white border-white'
                                            : 'bg-black border-gray-800 hover:border-gray-500'
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className="text-right text-[10px] text-gray-500 mt-1 h-4">
                                {rating > 0 ? `${rating} / 5` : ''}
                            </p>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">
                                Field Notes
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={`Notes for ${bean.name}...`}
                                className="w-full h-24 bg-black border border-gray-800 p-3 text-xs text-white placeholder-gray-700 focus:outline-none focus:border-white transition-colors resize-none"
                            />
                        </div>
                        <div className="pt-4 mt-4">
                            <button
                                onClick={handleSave}
                                disabled={saved}
                                className={`w-full py-3 border text-xs uppercase tracking-[0.2em] transition-all duration-500 ${saved
                                    ? 'bg-white text-black border-white'
                                    : 'border-gray-800 text-gray-400 hover:bg-white hover:text-black hover:border-white'
                                    }`}
                            >
                                {saved ? 'Recorded' : 'Commit Log'}
                            </button>
                        </div>
                    </div>

                    {/* History List */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">
                            History: {bean.name}
                        </h3>
                        {filteredHistory.length === 0 && <p className="text-xs text-gray-700 italic">No logs recorded.</p>}
                        {filteredHistory.map(log => (
                            <div key={log.id} className="border-l border-gray-800 pl-4 py-1 hover:border-white transition-colors group relative">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] text-gray-500">{log.date.split('T')[0]}</span>
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className={`w-1 h-1 rounded-full ${i < log.rating ? 'bg-white' : 'bg-gray-800'}`} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-300 line-clamp-2 group-hover:text-white transition-colors pr-6">{log.notes || "No notes."}</p>

                                {/* Delete Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm("Delete this tasting log?")) {
                                            const updatedHistory = history.filter(h => h.id !== log.id);
                                            setHistory(updatedHistory);
                                            localStorage.setItem('kugcc_logs', JSON.stringify(updatedHistory));
                                        }
                                    }}
                                    className="absolute top-1 right-0 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all text-[10px] border border-gray-800 hover:border-red-500 px-1 bg-black"
                                    title="Delete Log"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

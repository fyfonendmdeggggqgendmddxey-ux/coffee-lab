"use client";

import { useState, useEffect } from 'react';
import { Bean, DEFAULT_RECIPE } from '@/utils/types';
import BeanEntryModal from './BeanEntryModal';

interface BeanLibraryProps {
    onSelect?: (id: string) => void;
    selectedId?: string | null;
}

export default function BeanLibrary({ onSelect, selectedId }: BeanLibraryProps) {
    const [beans, setBeans] = useState<Bean[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingBean, setEditingBean] = useState<Bean | undefined>(undefined);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Load from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem('kugcc_beans');
        if (saved) {
            setBeans(JSON.parse(saved));
        } else {
            // Default seeds
            setBeans([
                { id: '1', name: 'Ethiopia Yirgacheffe', roaster: 'Kurasu', origin: 'Ethiopia', roastLevel: 'Light', process: 'Washed', roastDate: new Date().toISOString(), recipeOverride: DEFAULT_RECIPE },
                { id: '2', name: 'Colombia Huila', roaster: 'Onibus', origin: 'Colombia', roastLevel: 'Medium', process: 'Honey', roastDate: new Date().toISOString(), recipeOverride: DEFAULT_RECIPE },
                { id: '3', name: 'Kenya AA', roaster: 'Glitch', origin: 'Kenya', roastLevel: 'Light', process: 'Washed', roastDate: new Date().toISOString(), recipeOverride: DEFAULT_RECIPE },
            ]);
        }
        setIsLoaded(true);
    }, []);

    // Save to LocalStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('kugcc_beans', JSON.stringify(beans));
        }
    }, [beans, isLoaded]);

    const handleSaveBean = (bean: Bean) => {
        if (editingBean) {
            setBeans(beans.map(b => b.id === bean.id ? bean : b));
        } else {
            setBeans([...beans, bean]);
        }
        setShowModal(false);
        setEditingBean(undefined);
    };

    const confirmDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setDeleteConfirmId(id);
    }

    const executeDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setBeans(beans.filter(b => b.id !== id));
        setDeleteConfirmId(null);
    }

    const cancelDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteConfirmId(null);
    }

    const openEdit = (e: React.MouseEvent, bean: Bean) => {
        e.stopPropagation();
        setEditingBean(bean);
        setShowModal(true);
    }

    // Data Management
    const handleExportData = () => {
        const dataStr = JSON.stringify(beans, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `kugcc_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target?.result as string);
                if (Array.isArray(importedData)) {
                    // Smart Merge: Only add beans that don't exist by ID
                    const currentIds = new Set(beans.map(b => b.id));
                    const newBeans = importedData.filter((b: any) => !currentIds.has(b.id)); // Simple ID check

                    if (newBeans.length > 0) {
                        const mergedBeans = [...beans, ...newBeans];
                        setBeans(mergedBeans);
                        setBeans(mergedBeans); // React state update
                        localStorage.setItem('kugcc_beans', JSON.stringify(mergedBeans)); // Persist
                        alert(`Successfully imported ${newBeans.length} beans.\n(${importedData.length - newBeans.length} duplicates skipped to prevent overwrite)`);
                    } else {
                        alert("No new data found. All imported beans already exist.");
                    }
                } else {
                    alert("Invalid backup file format.");
                }
            } catch (error) {
                console.error("Import failed:", error);
                alert("Failed to parse backup file.");
            }
            // Reset input
            e.target.value = '';
        };
        reader.readAsText(file);
    };

    // Filter Logic
    const filteredBeans = beans.filter(bean => {
        const matchesSearch = bean.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bean.roaster.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (bean.origin || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (bean.variety || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter
            ? (activeFilter === 'Light' && bean.roastLevel === 'Light') ||
            (activeFilter === 'Dark' && (bean.roastLevel === 'Dark' || bean.roastLevel === 'Medium')) || // Grouping for demo
            (activeFilter === 'Washed' && bean.process === 'Washed') ||
            (activeFilter === 'Natural' && bean.process === 'Natural')
            : true;

        return matchesSearch && matchesFilter;
    });

    if (!isLoaded) return <div className="p-6 text-xs text-gray-600">Loading Library...</div>;

    return (
        <div className="h-full flex flex-col p-6 font-mono relative">
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase mb-6 text-gray-500 border-b border-gray-900 pb-2 flex justify-between items-center">
                <span>Bean Library</span>
                <span className="text-gray-700">{filteredBeans.length} / {beans.length}</span>
            </h2>

            {/* Search & Filter */}
            <div className="mb-6 space-y-3">
                <input
                    type="text"
                    placeholder="Search Origin / Roaster..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-900/50 border-none text-xs p-2 text-white placeholder-gray-600 focus:ring-1 focus:ring-gray-700 rounded-sm"
                />
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {['Light', 'Dark', 'Washed', 'Natural'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(activeFilter === filter ? null : filter)}
                            className={`px-2 py-1 text-[10px] uppercase tracking-wider border transition-all whitespace-nowrap ${activeFilter === filter
                                ? 'bg-white text-black border-white'
                                : 'text-gray-600 border-gray-800 hover:border-gray-600'
                                }`}
                        >
                            {/* Localize Tags logic */}
                            {filter === 'Light' ? '浅煎り' :
                                filter === 'Dark' ? '深煎り' :
                                    filter === 'Washed' ? 'ウォッシュト' : 'ナチュラル'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                {filteredBeans.map((bean) => (
                    <div
                        key={bean.id}
                        className={`group cursor-pointer relative py-3 px-2 border-l transition-all duration-300 ${selectedId === bean.id
                            ? 'border-white bg-gray-900'
                            : 'border-transparent hover:border-gray-500 hover:bg-gray-900/30'
                            }`}
                        onClick={() => onSelect?.(bean.id)}
                    >
                        {/* Action Buttons: Delete & Edit */}
                        <div className="absolute right-2 top-2 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => openEdit(e, bean)}
                                className="text-gray-600 hover:text-white text-[10px] border border-gray-800 hover:border-white px-1"
                            >
                                [EDIT]
                            </button>

                            {deleteConfirmId === bean.id ? (
                                <div className="flex bg-black border border-red-500">
                                    <button onClick={(e) => executeDelete(e, bean.id)} className="text-red-500 hover:bg-red-500 hover:text-white text-[10px] px-2 font-bold">YES</button>
                                    <button onClick={cancelDelete} className="text-gray-500 hover:text-white text-[10px] px-2 border-l border-red-900">NO</button>
                                </div>
                            ) : (
                                <button
                                    onClick={(e) => confirmDelete(e, bean.id)}
                                    className="text-gray-600 hover:text-red-500 text-[10px] border border-gray-800 hover:border-red-500 px-1"
                                >
                                    [DEL]
                                </button>
                            )}
                        </div>

                        <h3 className={`text-sm font-medium transition-colors tracking-wide ${selectedId === bean.id ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                            {bean.name}
                        </h3>
                        <p className="text-[10px] text-gray-500 mb-1">{bean.roaster}</p>
                        <div className="flex gap-2 mt-1">
                            <span className="text-[10px] text-gray-600 uppercase tracking-widest">
                                {bean.roastLevel === 'Light' ? '浅煎り' : bean.roastLevel === 'Medium' ? '中煎り' : '深煎り'}
                            </span>
                            <span className="text-[10px] text-gray-700">/</span>
                            <span className="text-[10px] text-gray-600 uppercase tracking-widest">
                                {bean.process === 'Washed' ? 'ウォッシュト' : bean.process === 'Natural' ? 'ナチュラル' : bean.process}
                            </span>
                        </div>
                        <div className="mt-2 text-[10px] text-gray-500 font-mono">
                            Roast: {bean.roastDate ? bean.roastDate.split('T')[0] : 'Unknown'}
                        </div>
                    </div>
                ))}
            </div>
            <div className="pt-6 border-t border-gray-900 mt-4">
                <button
                    onClick={() => { setEditingBean(undefined); setShowModal(true); }}
                    className="w-full py-3 border border-gray-800 text-xs text-gray-400 hover:bg-white hover:text-black hover:border-white transition-all duration-300 uppercase tracking-[0.2em]"
                >
                    + Add Entry
                </button>
            </div>

            {/* Data Management Footer */}
            <div className="pt-4 border-t border-gray-900 mt-2 flex gap-2">
                <button
                    onClick={handleExportData}
                    className="flex-1 py-2 text-[10px] text-gray-500 hover:text-white border border-gray-800 hover:border-gray-500 transition-colors uppercase tracking-wider"
                >
                    Export Backup
                </button>
                <label className="flex-1 py-2 text-[10px] text-gray-500 hover:text-white border border-gray-800 hover:border-gray-500 transition-colors uppercase tracking-wider text-center cursor-pointer">
                    Import Data
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleImportData}
                        className="hidden"
                    />
                </label>
            </div>

            {showModal && (
                <BeanEntryModal
                    onSave={handleSaveBean}
                    onCancel={() => { setShowModal(false); setEditingBean(undefined); }}
                    initialBean={editingBean}
                />
            )}
        </div>
    );
}

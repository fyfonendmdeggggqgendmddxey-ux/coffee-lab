import React from 'react';

interface DashboardLayoutProps {
    left: React.ReactNode;
    center: React.ReactNode;
    right: React.ReactNode;
}

export default function DashboardLayout({ left, center, right }: DashboardLayoutProps) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-black text-white">
            {/* Left Column: Bean Library / Settings */}
            <aside className="w-[280px] border-r border-[#333] flex flex-col">
                {left}
            </aside>

            {/* Center Column: Main Timer & Action */}
            <main className="flex-1 flex flex-col items-center justify-center relative">
                {center}
            </main>

            {/* Right Column: AI Insights / Log */}
            <aside className="w-[280px] border-l border-[#333] flex flex-col bg-black">
                {right}
            </aside>
        </div>
    );
}

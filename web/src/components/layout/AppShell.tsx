"use client";

import { useState, Suspense } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Menu } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Mobile toggle
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex min-h-screen bg-[zinc-950] text-gray-100">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:fixed inset-y-0 left-0 z-50
                w-64 transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                lg:translate-x-0
            `}>
                <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen lg:ml-64 transition-all duration-300">
                <Suspense fallback={<div className="h-16 bg-zinc-900 border-b border-white/5 sticky top-0 z-40" />}>
                    <Topbar onMenuClick={toggleSidebar} />
                </Suspense>

                <main className="p-4 lg:p-8 flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

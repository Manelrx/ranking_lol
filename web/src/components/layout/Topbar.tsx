"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Menu } from "lucide-react";

interface TopbarProps {
    onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentQueue = searchParams.get("queue")?.toUpperCase() === "FLEX" ? "FLEX" : "SOLO";

    const toggleQueue = useCallback(
        (queue: "SOLO" | "FLEX") => {
            const params = new URLSearchParams(searchParams.toString());
            if (queue === "SOLO") params.delete("queue");
            else params.set("queue", "FLEX");

            router.push(`?${params.toString()}`);
        },
        [router, searchParams]
    );

    return (
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-white/5 bg-[var(--color-surface)]/80 backdrop-blur-md sticky top-0 z-40 transition-all">
            {/* Left: Menu Trigger & Title */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 rounded-lg lg:hidden text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <div className="hidden sm:flex items-center space-x-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Season 2026</span>
                </div>
            </div>

            {/* Right: Queue Toggle */}
            <div className="flex bg-black/40 p-1 rounded-lg border border-white/10 backdrop-blur-sm">
                <button
                    onClick={() => toggleQueue("SOLO")}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentQueue === "SOLO"
                            ? "bg-emerald-600/90 text-white shadow-lg shadow-emerald-500/20"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                >
                    Solo/Duo
                </button>
                <button
                    onClick={() => toggleQueue("FLEX")}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentQueue === "FLEX"
                            ? "bg-emerald-600/90 text-white shadow-lg shadow-emerald-500/20"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                >
                    Flex
                </button>
            </div>
        </header>
    );
}

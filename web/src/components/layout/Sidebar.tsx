"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, TrendingUp, Users, Home, Activity, X, Info } from "lucide-react";

interface SidebarProps {
    onClose?: () => void;
}

const MENU_ITEMS = [
    { label: "Geral", href: "/", icon: Home },
    { label: "Ranking por Elo", href: "/ranking/elo", icon: Trophy },
    { label: "Ganho de PDL", href: "/ranking/pdl", icon: TrendingUp },
    { label: "Jogadores", href: "/players", icon: Users },
    { label: "Insights", href: "/insights", icon: Activity },
    { label: "Ajuda & Regras", href: "/help", icon: Info },
];

export function Sidebar({ onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className="h-full bg-[var(--color-surface)]/95 backdrop-blur-xl border-r border-white/10 flex flex-col shadow-2xl">
            {/* Header / Logo */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-black/20">
                <div className="flex items-center">
                    <Activity className="w-6 h-6 text-emerald-400 mr-3 animate-pulse" />
                    <span className="text-xl font-bold tracking-tight text-white">
                        Rift<span className="text-emerald-400">Score</span>
                    </span>
                </div>
                {/* Mobile Close Button */}
                <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose} // Auto-close on mobile nav
                            className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden ${isActive
                                ? "bg-emerald-500/10 text-emerald-300 font-medium"
                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-md" />
                            )}

                            <item.icon
                                className={`w-5 h-5 mr-3 transition-colors ${isActive ? "text-emerald-400" : "text-gray-500 group-hover:text-emerald-200"
                                    }`}
                            />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Version */}
            <div className="p-4 border-t border-white/10 bg-black/20">
                <div className="text-xs text-gray-500 text-center font-mono">
                    Season 2026 • v2.0
                </div>
            </div>
        </aside>
    );
}

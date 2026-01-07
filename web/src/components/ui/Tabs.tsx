"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TabsProps {
    tabs: { id: string; label: string; icon?: React.ElementType }[];
    activeTab: string;
    onChange: (id: string) => void;
    className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
    return (
        <div className={cn("flex flex-wrap gap-2", className)}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={cn(
                            "relative px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                            isActive ? "text-white" : "text-gray-400 hover:text-gray-200"
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-white/10 rounded-lg border border-white/10"
                                initial={false}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                        {tab.icon && <tab.icon className={cn("w-4 h-4", isActive ? "text-emerald-400" : "text-gray-500")} />}
                        <span className="relative z-10">{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}

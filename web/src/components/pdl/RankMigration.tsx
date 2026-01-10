"use client";

import { EloBadge } from "@/components/EloBadge";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface RankMigrationProps {
    startTier?: string;
    startRank?: string;
    endTier: string;
    endRank: string;
}

export function RankMigration({ startTier, startRank, endTier, endRank }: RankMigrationProps) {
    // If no start info or same tier, just show current
    // But for "Movers", we usually want to show movement.
    // If undefined, maybe just show endTier.

    if (!startTier) {
        return <EloBadge tier={endTier} rank={endRank} />;
    }

    return (
        <div className="flex items-center gap-2">
            <div className="opacity-60 scale-90 grayscale hover:grayscale-0 transition-all duration-300">
                <EloBadge tier={startTier} rank={startRank} />
            </div>

            <motion.div
                animate={{ x: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="text-gray-600"
            >
                <ArrowRight size={14} />
            </motion.div>

            <div className="scale-105 shadow-xl shadow-emerald-500/10 rounded-full">
                <EloBadge tier={endTier} rank={endRank} />
            </div>
        </div>
    );
}

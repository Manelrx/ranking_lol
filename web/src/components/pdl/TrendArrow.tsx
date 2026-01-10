"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

interface TrendArrowProps {
    trend: 'UP' | 'DOWN' | 'SAME';
    size?: number;
}

export function TrendArrow({ trend, size = 16 }: TrendArrowProps) {
    if (trend === 'UP') {
        return (
            <motion.div
                initial={{ y: 2, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-emerald-400"
            >
                <TrendingUp size={size} />
            </motion.div>
        );
    }

    if (trend === 'DOWN') {
        return (
            <motion.div
                initial={{ y: -2, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-red-400"
            >
                <TrendingDown size={size} />
            </motion.div>
        );
    }

    return (
        <div className="text-gray-500">
            <Minus size={size} />
        </div>
    );
}

"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface CardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    variant?: "glass" | "solid" | "outlined";
    hoverEffect?: boolean;
}

export function Card({
    children,
    className,
    variant = "glass",
    hoverEffect = false,
    ...props
}: CardProps) {
    const variants = {
        glass: "bg-[var(--color-surface)]/60 backdrop-blur-md border border-white/5",
        solid: "bg-[var(--color-surface)] border border-[var(--color-border)]",
        outlined: "bg-transparent border border-white/10"
    };

    return (
        <motion.div
            className={cn(
                "rounded-xl p-6 transition-all duration-300",
                variants[variant],
                hoverEffect && "hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-1",
                className
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

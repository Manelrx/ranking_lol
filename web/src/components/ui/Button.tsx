"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    children: React.ReactNode;
}

export function Button({
    variant = "primary",
    size = "md",
    className,
    children,
    ...props
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20",
        secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/5",
        outline: "border border-white/10 text-gray-300 hover:text-white hover:border-emerald-500/50 hover:bg-emerald-500/5",
        ghost: "text-gray-400 hover:text-white hover:bg-white/5"
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base"
    };

    return (
        <motion.button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
            {...props}
        >
            {children}
        </motion.button>
    );
}

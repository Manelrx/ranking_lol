"use client";

import { motion, useSpring, useTransform, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

interface AnimatedCounterProps {
    value: number;
    format?: boolean; // If true, formats as integer (0 decimal). If false or undefined, no decimal constraint (or 2 decimal logic if needed)
    className?: string;
    suffix?: string;
    decimals?: number;
}

export function AnimatedCounter({ value, format = true, className = "", suffix = "", decimals = 0 }: AnimatedCounterProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });

    const spring = useSpring(0, {
        mass: 0.8,
        stiffness: 75,
        damping: 15
    });

    const display = useTransform(spring, (current) => {
        if (format) {
            return current.toFixed(decimals);
        }
        return current.toFixed(decimals);
    });

    useEffect(() => {
        const unsubscribe = display.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = latest + suffix;
            }
        });
        return () => unsubscribe();
    }, [display, suffix]);

    useEffect(() => {
        if (inView) {
            spring.set(value);
        }
    }, [inView, value, spring]);

    return (
        <span ref={ref} className={className} />
    );
}

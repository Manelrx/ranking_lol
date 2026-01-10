'use client';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

export function AnimatedCounter({ value, duration = 1.5, className }: { value: number | string; duration?: number; className?: string }) {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    const isFloat = typeof value === 'string' && value.includes('.');

    // Spring animation for smooth counting
    const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
    const display = useTransform(spring, (current) =>
        isFloat ? current.toFixed(1) : Math.round(current).toLocaleString()
    );

    useEffect(() => {
        spring.set(Number.isNaN(numericValue) ? 0 : numericValue);
    }, [spring, numericValue]);

    if (Number.isNaN(numericValue)) {
        return <span className={className}>{value}</span>;
    }

    return <motion.span className={className}>{display}</motion.span>;
}

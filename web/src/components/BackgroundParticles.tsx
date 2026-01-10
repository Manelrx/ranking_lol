'use client';

import { motion } from "framer-motion";
import { TierTheme } from "@/lib/tier-themes";

interface BackgroundParticlesProps {
    theme: TierTheme;
}

export function BackgroundParticles({ theme }: BackgroundParticlesProps) {
    if (!theme.styles.particles) return null;

    // Generate random particles
    const particles = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        duration: Math.random() * 10 + 10,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                        backgroundColor: theme.colors.hex,
                        boxShadow: `0 0 ${p.size * 2}px ${theme.colors.hex}`,
                    }}
                    animate={{
                        y: [0, -100, 0],
                        opacity: [0, 0.5, 0],
                        scale: [0, 1.5, 0],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 5,
                    }}
                />
            ))}
        </div>
    );
}

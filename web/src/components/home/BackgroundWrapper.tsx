'use client';

import { motion } from 'framer-motion';

interface BackgroundWrapperProps {
    championName?: string;
    className?: string;
}

export function BackgroundWrapper({ championName, className }: BackgroundWrapperProps) {
    const bgImage = championName
        ? `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championName}_0.jpg`
        : 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Aatrox_0.jpg'; // Fallback

    return (
        <div className={`fixed inset-0 z-[-1] overflow-hidden pointer-events-none ${className}`}>
            {/* Dynamic Champion Background */}
            <motion.div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 blur-sm scale-110"
                style={{ backgroundImage: `url(${bgImage})` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                transition={{ duration: 1.5 }}
            />

            {/* Overlays for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-[#0a0a0a]/60" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0a0a0a_90%)]" />

            {/* Subtle Texture */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("/grid-pattern.svg")' }} />
        </div>
    );
}

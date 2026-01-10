'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { TierTheme } from "@/lib/tier-themes";
import { motion } from "framer-motion";

interface PlaystyleRadarProps {
    playstyle: {
        combat: number;
        objectives: number;
        discipline: number;
    };
    theme: TierTheme;
}

export function PlaystyleRadar({ playstyle, theme }: PlaystyleRadarProps) {
    const data = [
        { subject: 'Performance', A: playstyle.combat, fullMark: 100 },
        { subject: 'Objetivos', A: playstyle.objectives, fullMark: 100 },
        { subject: 'Disciplina', A: playstyle.discipline, fullMark: 100 },
    ];

    // Determine hex color (default to emerald if missing)
    const chartColor = theme.colors.hex || '#10b981';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className={`${theme.styles.borderRadius} p-6 ${theme.colors.cardBg} relative overflow-hidden flex flex-col items-center justify-center`}
        >
            <h3 className={`text-xs font-bold uppercase tracking-widest ${theme.colors.textSecondary} mb-4 w-full text-left`}>
                Estilo de Jogo
            </h3>

            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke={theme.colors.hex ? `${theme.colors.hex}33` : '#ffffff33'} />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 'bold' }}
                        />
                        <Radar
                            name="Player"
                            dataKey="A"
                            stroke={chartColor}
                            strokeWidth={2}
                            fill={chartColor}
                            fillOpacity={0.4}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Legend/Score Summary */}
            <div className="flex justify-between w-full mt-2 px-4">
                <div className="text-center">
                    <div className="text-[10px] text-zinc-500 uppercase">Performance</div>
                    <div className="text-sm font-bold text-white">{playstyle.combat}</div>
                </div>
                <div className="text-center">
                    <div className="text-[10px] text-zinc-500 uppercase">Obj</div>
                    <div className="text-sm font-bold text-white">{playstyle.objectives}</div>
                </div>
                <div className="text-center">
                    <div className="text-[10px] text-zinc-500 uppercase">Disc</div>
                    <div className="text-sm font-bold text-white">{playstyle.discipline}</div>
                </div>
            </div>
        </motion.div>
    );
}

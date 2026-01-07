"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PlayerHistoryEntry } from "@/lib/api";

// Tier Base Values
const TIER_VALUES: Record<string, number> = {
    IRON: 0,
    BRONZE: 400,
    SILVER: 800,
    GOLD: 1200,
    PLATINUM: 1600,
    EMERALD: 2000,
    DIAMOND: 2400,
    MASTER: 2800,
    GRANDMASTER: 2800,
    CHALLENGER: 2800,
    UNRANKED: 0
};

export function PdlChart({ history }: { history: PlayerHistoryEntry[] }) {
    if (!history || history.length === 0) return (
        <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Sem dados de histórico suficientes.
        </div>
    );

    const data = history.map(h => ({
        date: new Date(h.date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' }),
        value: (TIER_VALUES[h.tier] || 0) + h.lp,
        tier: h.tier,
        lp: h.lp,
        fullDate: new Date(h.date).toLocaleDateString()
    }));

    return (
        <div className="w-full h-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#52525b"
                        tick={{ fill: '#71717a', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis
                        stroke="#52525b"
                        tick={{ fill: '#71717a', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        domain={['auto', 'auto']}
                        tickFormatter={(value) => {
                            // Reverse lookup approximately
                            if (value >= 2800) return "CHALL";
                            if (value >= 2400) return "DIA";
                            if (value >= 2000) return "EMERALD";
                            if (value >= 1600) return "PLAT";
                            if (value >= 1200) return "GOLD";
                            if (value >= 800) return "SILVER";
                            if (value >= 400) return "BRONZE";
                            return "IRON";
                        }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#18181b",
                            borderColor: "rgba(255,255,255,0.1)",
                            borderRadius: "12px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                            color: "#E5E7EB"
                        }}
                        itemStyle={{ color: "#E5E7EB", fontSize: "12px" }}
                        formatter={(value: any, name: any, props: any) => [
                            <span key="val" className="font-bold text-white">{props.payload.tier} <span className="text-[var(--color-primary)]">{props.payload.lp} PDL</span></span>,
                            '' // Hide label
                        ]}
                        labelFormatter={(label) => <span className="text-gray-400 text-xs mb-2 block">{label}</span>}
                        cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#6366f1"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                        activeDot={{ r: 6, fill: '#fff', stroke: '#6366f1', strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

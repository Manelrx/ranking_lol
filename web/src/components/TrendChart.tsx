"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "./ui/Card";

// Mock Data for Trend (Until Backend supports Aggregation)
const MOCK_TREND = [
    { date: "Seg", score: 65 },
    { date: "Ter", score: 68 },
    { date: "Qua", score: 66 },
    { date: "Qui", score: 72 },
    { date: "Sex", score: 75 },
    { date: "Sáb", score: 78 },
    { date: "Dom", score: 74 },
];

export function TrendChart() {
    return (
        <Card className="h-[300px] w-full" variant="glass">
            <h3 className="text-sm font-semibold text-gray-400 mb-4 px-2 tracking-wider uppercase">Tendência do Servidor (Média)</h3>
            <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={MOCK_TREND}>
                    <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#71717a"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#71717a"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        domain={[50, 90]}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#18181b",
                            borderColor: "#27272a",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                        itemStyle={{ color: "#10b981" }}
                    />
                    <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorScore)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </Card>
    );
}

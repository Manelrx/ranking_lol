'use client';

export function StatCard({ label, value, subtext }: { label: string; value: string | number; subtext?: string }) {
    return (
        <div className="bg-[var(--color-surface)] p-5 rounded-xl border border-gray-800">
            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">{label}</h3>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{value}</span>
                {subtext && <span className="text-xs text-gray-500">{subtext}</span>}
            </div>
        </div>
    );
}

export function getStartOfWeek(date: Date = new Date()): Date {
    const d = new Date(date);
    const day = d.getDay(); // 0 (Sun) to 6 (Sat)
    // Adjust so 0 is Monday, 6 is Sunday
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
}

export function isWithinWeek(dateStr: string): boolean {
    const date = new Date(dateStr);
    const startOfWeek = getStartOfWeek();
    return date >= startOfWeek;
}

// Format: "12 jan"
export function formatDateShort(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}

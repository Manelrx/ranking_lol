import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function normalizeChampionName(name?: string): string {
    if (!name) return 'Aatrox';
    // Remove spaces, apostrophes, dots
    let clean = name.replace(/[^a-zA-Z]/g, '');

    const exceptions: Record<string, string> = {
        'Wukong': 'MonkeyKing',
        'RenataGlasc': 'Renata',
        'Belveth': 'Belveth',
        'KogMaw': 'KogMaw',
        'RekSai': 'RekSai',
        'LeBlanc': 'Leblanc',
        'NunuWillump': 'Nunu',
        'Nunu': 'Nunu',
        'ChoGath': 'Chogath',
        'KaiSa': 'Kaisa',
        'VelKoz': 'Velkoz',
        'DrMundo': 'DrMundo',
        'MasterYi': 'MasterYi',
        'Fiddlesticks': 'Fiddlesticks',
        'JarvanIV': 'JarvanIV',
        'TahmKench': 'TahmKench',
        'XinZhao': 'XinZhao',
        'MissFortune': 'MissFortune',
        'TwistedFate': 'TwistedFate',
    };

    return exceptions[clean] || clean;
}

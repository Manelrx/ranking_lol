export interface PlayerConfig {
    gameName: string;
    tagLine: string;
    isActive: boolean;
}

// Fonte única da verdade. Sincronizada com o Banco de Dados.
export const TRACKED_PLAYERS: PlayerConfig[] = [
    { gameName: "YasoneShelby", tagLine: "1908", isActive: true },
    { gameName: "naRy", tagLine: "0000", isActive: true },
    { gameName: "Draps", tagLine: "br1", isActive: true },
    // Manter Test inativo ou remover
    { gameName: "Test", tagLine: "Schema", isActive: false },
];

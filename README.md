# League of Legends Annual Ranking System

Sistema de ranking anual para League of Legends, focado em consistência e performance relativa. O sistema calcula um **MatchScore (0-100)** para cada partida, comparando o desempenho do jogador com a média da sua lane naquela partida específica.

## 📋 Funcionalidades Principais

-   **MatchScore Engine**: Algoritmo determinístico que avalia Resultado, Performance (vs Lane), Objetivos e Disciplina.
-   **Contexto Relativo**: Nenhuma métrica é absoluta. O sistema compara seu Farm/Dano/Visão contra o oponente de lane.
-   **Auditoria**: Armazena as médias da lane junto com o score para permitir verificação futura.
-   **CLI de Teste**: Ferramenta para calcular e validar o score de qualquer partida em tempo real.
-   **Filtros Rígidos**: Ignora remakes (<10min) e partidas fora da Season.

## 🛠 Tech Stack

-   **Linguagem**: Node.js / TypeScript
-   **Banco de Dados**: PostgreSQL
-   **ORM**: Prisma
-   **API**: Riot Games API (Match-V5, Account-V1)

## 🚀 Configuração

1.  **Instale as dependências**:
    ```bash
    npm install
    ```

2.  **Configure o ambiente**:
    Renomeie `.env.example` para `.env` e adicione suas credenciais:
    ```env
    DATABASE_URL="postgresql://user:pass@localhost:5432/ranking_lol"
    RIOT_API_KEY="RGAPI-SEU-KEY-AQUI"
    ```

3.  **Habilite o Prisma** (se for conectar ao banco):
    ```bash
    npx prisma generate
    ```

## 🎮 Como Usar (CLI)

O projeto inclui um script CLI para testar a lógica de pontuação sem precisar salvar no banco de dados. Ideal para auditar partidas.

**Sintaxe**:
```bash
npx ts-node src/cli/test-score.ts <PUUID> <MATCH_ID>
```

**Exemplo de Saída**:
```json
{
  "matchScore": 84,
  "breakdown": {
    "result": 25,
    "performance": 37,
    "objectives": 12,
    "discipline": 10
  },
  "laneContext": { ... }
}
```

## ⚖️ Regras de Pontuação (Canonical 60-30-10)

O sistema utiliza um motor de pontuação rígido (`scoring.engine.ts`) com score máximo de **100**.

### 1. Estrutura de Vitória (100 Ptos)
| Bloco | Max | Descrição |
|-------|-----|-----------|
| **Performance** | 60 | Métricas específicas por lane (CS, Dano, etc) calculadas via *ratio* vs oponente. |
| **Objetivos** | 30 | Torres (10), Dragões (10), Arauto (5), Barão (5). |
| **Disciplina** | 10 | Mortes vs Oponente (Menos=10, Igual=5, Mais=0). |

### 2. Pesos por Lane (Performance)
Cada função tem foco diferente para somar os 60 pontos de performance:
*   **TOP**: CS(15), Dano(15), Tankiness(10), KP(10), Visão(10)
*   **JUNGLE**: Objetivos Globais(25), Visão(15), KP(10), Gold(5), Dano(5)
*   **MID**: Dano(20), CS(15), KP(10), Visão(10), Gold(5)
*   **ADC**: CS(20), Dano(20), KP(10), Visão(5), Gold(5)
*   **SUP**: Visão(25), KP(15), Part. Objetivos(10), Gold(5), Dano(5)

### 3. Regras de Derrota (Teto 40)
*   **KP Mínimo**: Se seu Kill Participation for < 35%, o score é **0**.
*   **Teto**: Máximo de 40 pontos.
*   **Performance**: Pontua no máximo 20 (apenas métricas onde você venceu o oponente).
*   **Objetivos**: Pontua no máximo 10.
*   **Disciplina**: Pontua no máximo 10.

### 4. Exclusões
*   Partidas < 10 minutos.
*   Partidas fora da Season (Datas controladas).

*O cálculo é determinístico: `metricScore(ratio)` com piso 20% (ratio 0.7) e teto 100% (ratio 1.3).*

## 📂 Estrutura do Projeto

-   `/src/engine`: Lógica pura de cálculo (Scoring Engine).
-   `/src/services`: Integração com Riot API e Rate Limiting.
-   `/src/cli`: Scripts de linha de comando.
-   `/prisma`: Schema do banco de dados e migrações.

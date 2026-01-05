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

## ⚖️ Regras de Pontuação (Resumo)

O score máximo é **100**.

1.  **Resultado (0-25)**: Vitória = 25, Derrota = 10.
2.  **Performance (0-45)**: 5 métricas (KDA, CS, Gold, Dano, Visão) comparadas com a média da lane.
3.  **Objetivos (0-20)**: Participação em Torres, Dragões, Arauto e Barão.
4.  **Disciplina (0-10)**: Mortes comparadas com a média da lane.

*Nota: Partidas com menos de 10 minutos são ignoradas.*

## 📂 Estrutura do Projeto

-   `/src/engine`: Lógica pura de cálculo (Scoring Engine).
-   `/src/services`: Integração com Riot API e Rate Limiting.
-   `/src/cli`: Scripts de linha de comando.
-   `/prisma`: Schema do banco de dados e migrações.

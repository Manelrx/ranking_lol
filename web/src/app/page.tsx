'use client';

import { useEffect, useState } from 'react';
import {
  getSeasonRanking,
  getHighlights,
  getPdlGainRanking,
  getHallOfFame,
  getHallOfShame,
  getPlayerInsights,
  RankingEntry,
  PeriodHighlights,
  PdlGainEntry,
  HallOfFameData,
  HallOfShameData,
  HighlightPlayer
} from '@/lib/api';
import { useQueue } from '@/contexts/QueueContext';

// Components
import { HeroSection } from '@/components/home/HeroSection';
import { WeeklySpotlight } from '@/components/home/WeeklySpotlight';
import { HighlightsCarousel } from '@/components/home/HighlightsCarousel';
import { WeeklyClimbers } from '@/components/home/WeeklyClimbers';
import { Ticker } from '@/components/home/Ticker';

type HomeData = {
  ranking: RankingEntry[];
  highlights: PeriodHighlights | null;
  trends: PdlGainEntry[];
  fame: HallOfFameData | null;
  shame: HallOfShameData | null;
  tickerData: PdlGainEntry[]; // Special combined list for ticker
};

export default function Home() {
  const { queueType } = useQueue();

  const [data, setData] = useState<HomeData>({
    ranking: [],
    highlights: null,
    trends: [],
    fame: null,
    shame: null,
    tickerData: []
  });
  const [loading, setLoading] = useState(true);

  // BAGRE Score State
  const [bagreScore, setBagreScore] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch Primary Data based on selected Queue
        const currentQueue = queueType || 'SOLO';

        const [rankingRes, highlightsRes, trendsRes, fameRes, shameRes] = await Promise.allSettled([
          getSeasonRanking(currentQueue, 5),
          getHighlights(currentQueue, 'WEEKLY'),
          getPdlGainRanking(currentQueue, 50),
          getHallOfFame(currentQueue, 'WEEKLY'),
          getHallOfShame(currentQueue, 'WEEKLY')
        ]);

        // FETCH SECONDARY DATA for Ticker (The OTHER queue)
        let otherQueueTrends: PdlGainEntry[] = [];
        const otherQueue = currentQueue === 'SOLO' ? 'FLEX' : 'SOLO';

        try {
          otherQueueTrends = await getPdlGainRanking(otherQueue, 30);
        } catch (e) {
          console.warn(`Failed to fetch ${otherQueue} trends`, e);
        }

        const primaryTrends = trendsRes.status === 'fulfilled' ? trendsRes.value : [];

        // Combine and format trends for Ticker
        const combinedTicker = [
          ...primaryTrends.map(t => ({ ...t, queueType: currentQueue })),
          ...otherQueueTrends.map(t => ({ ...t, queueType: otherQueue }))
        ].sort((a, b) => b.pdlGain - a.pdlGain);

        setData({
          ranking: rankingRes.status === 'fulfilled' ? rankingRes.value : [],
          highlights: highlightsRes.status === 'fulfilled' ? highlightsRes.value : null,
          trends: primaryTrends,
          fame: fameRes.status === 'fulfilled' ? fameRes.value : null,
          shame: shameRes.status === 'fulfilled' ? shameRes.value : null,
          tickerData: combinedTicker as any
        });
      } catch (e) {
        console.error("Data error", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [queueType]);

  // --- Derived NARRATIVE Logic ---
  const top1Player = data.ranking.length > 0 ? data.ranking[0] : null;
  const top1Delta = top1Player ? data.trends.find(t => t.puuid === top1Player.puuid)?.pdlGain : null;

  const mvpPlayer = data.highlights?.mvp || null;

  // BAGRE LOGIC (Improved)
  // 1. First check API specific shame (Solo Doador matches Bagre vibe)
  let antiMvpPlayer: HighlightPlayer | null = data.shame?.soloDoador || null;

  // Fallback to biggest loser if no specific shame entry
  if (!antiMvpPlayer) {
    const sortedTrends = [...data.trends].sort((a, b) => a.pdlGain - b.pdlGain);
    const biggestLoser = sortedTrends.length > 0 && sortedTrends[0].pdlGain < -15 ? sortedTrends[0] : null;

    if (biggestLoser) {
      antiMvpPlayer = {
        puuid: biggestLoser.puuid,
        gameName: biggestLoser.gameName,
        tagLine: biggestLoser.tagLine,
        profileIconId: biggestLoser.profileIconId,
        value: `${biggestLoser.pdlGain} PDL`, // Fallback value
        label: 'Derreteu na semana',
        championName: 'Troll Pick?',
        tier: biggestLoser.tier
      };
    }
  }

  // 2. Fetch AvgScore for Bagre specifically
  useEffect(() => {
    async function fetchBagreStats() {
      if (antiMvpPlayer && !bagreScore) {
        try {
          const insights = await getPlayerInsights(antiMvpPlayer.puuid, queueType || 'SOLO');
          if (insights?.stats?.avgScore) {
            setBagreScore(insights.stats.avgScore);
          }
        } catch (e) {
          console.warn("Could not fetch bagre score", e);
        }
      }
    }
    fetchBagreStats();
  }, [antiMvpPlayer?.puuid, queueType]); // Ensure dependencies are correct

  // Apply the corrected score if available
  if (antiMvpPlayer && bagreScore) {
    antiMvpPlayer = {
      ...antiMvpPlayer,
      value: bagreScore
    };
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 rounded-full animate-spin border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-8 h-8 text-emerald-400" />
            Visão Geral
          </h1>
          <p className="text-gray-400 mt-1">Acompanhe a performance do servidor em tempo real.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 self-start">
          <span className={`w-2 h-2 rounded-full ${queue === 'SOLO' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]'}`}></span>
          <span className="text-sm font-medium text-gray-300">
            Fila: <span className="text-white font-bold">{queue === 'SOLO' ? 'Solo/Duo' : 'Flex'}</span>
          </span>
        </div>
      </section>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Líder do Rank"
          value={stats?.leader?.gameName || '-'}
          subtext={stats?.leader ? `Elo: ${stats.leader.tier}` : 'Sem dados'}
          icon={Crown}
          color="text-yellow-400"
        />
        <KPICard
          label="Média de Pontos"
          value={stats?.avgScore || '0.0'}
          subtext="RiftScore Index"
          icon={Zap}
          color="text-emerald-400"
        />
        <KPICard
          label="Total de Partidas"
          value={stats?.totalGames.toString() || '0'}
          subtext="Analisadas na Season"
          icon={Users}
          color="text-blue-400"
        />
        {/* Placeholder for Trend or MVP */}
        <Card className="p-0 border-0 bg-transparent flex items-center justify-center">
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Destaque</p>
            <div className="text-xl font-bold text-white">EM BREVE</div>
          </div>
        </Card>
      </div>

      {/* 1. TICKER (Top Bar) - Shows Mix of Updates */}
      <div className="relative z-50">
        <Ticker trends={data.tickerData} />
      </div>

      {/* Right Column: Ranking Table (Takes 2/3) */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Classificação
            <span className="text-xs font-normal text-gray-500 bg-white/5 px-2 py-0.5 rounded ml-2">Top 100</span>
          </h3>
        </div>

        {/* Side Panel: Climbers & Losers */}
        <WeeklyClimbers trends={data.trends} />
      </div>
    </div>

    </div >
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>}>
      <HomeContent />
    </Suspense>
  );
}

function KPICard({ label, value, subtext, icon: Icon, color }: any) {
  return (
    <Card hoverEffect className="relative overflow-hidden group">
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
          <Icon className={`w-5 h-5 ${color} opacity-70 group-hover:opacity-100 transition-opacity`} />
        </div>
        <div className="text-2xl font-bold text-white tracking-tight mb-1 truncate">{value}</div>
        <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">{subtext}</p>
      </div>
      {/* Decoration */}
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity blur-2xl ${color.replace('text-', 'bg-')}`} />
    </Card>
  );
}

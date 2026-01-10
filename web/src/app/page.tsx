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
    <div className="bg-[#050505] text-white selection:bg-emerald-500/30 w-full font-sans relative pb-32">

      {/* 0. GLOBAL ATMOSPHERE */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#050505] via-[#050505] to-[#080c0a]" />
      </div>

      {/* 1. TICKER (Top Bar) - Shows Mix of Updates */}
      <div className="relative z-50">
        <Ticker trends={data.tickerData} />
      </div>

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 md:px-8 pt-8">

        {/* Spacer for aesthetics since header is gone */}
        <div className="h-8" />

        {/* 2. HERO SECTION */}
        <HeroSection player={top1Player} pdlDelta={top1Delta} />

        {/* 3. WEEKLY SPOTLIGHT (Heaven & Hell) */}
        <WeeklySpotlight mvp={mvpPlayer} antiMvp={antiMvpPlayer} />

        {/* 4. STORIES & CLIMBERS GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 mb-24">

          {/* Highlights (Stories) */}
          <div className="xl:col-span-8">
            <HighlightsCarousel fame={data.fame} shame={data.shame} />
          </div>

          {/* Side Panel: Climbers & Losers */}
          <WeeklyClimbers trends={data.trends} />
        </div>

      </div>
    </div>
  );
}

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { getSeasonRanking, RankingEntry } from '@/lib/api';
import { RankingTable } from '@/components/RankingTable';
import { TrendChart } from '@/components/TrendChart';
import { Card } from '@/components/ui/Card';
import { Trophy, Users, Zap, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const searchParams = useSearchParams();
  const queue = (searchParams.get('queue')?.toUpperCase() === 'FLEX' ? 'FLEX' : 'SOLO') as 'SOLO' | 'FLEX';

  const [data, setData] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getSeasonRanking(queue);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [queue]);

  const stats = useMemo(() => {
    if (data.length === 0) return null;
    const leader = data[0];
    const totalGames = data.reduce((acc, curr) => acc + curr.gamesUsed, 0);
    const avgScore = data.reduce((acc, curr) => acc + curr.totalScore, 0) / data.length;

    return {
      leader,
      totalGames,
      avgScore: avgScore.toFixed(1),
    };
  }, [data]);

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

      {/* Content Grid: Chart + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Trend Chart (Takes 1/3 space on huge screens, full on smaller) */}
        <div className="lg:col-span-1 space-y-8">
          <TrendChart />

          {/* Mini Insight Box */}
          <Card variant="outlined" className="p-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Insight Rápido</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              A média de pontuação do servidor subiu <span className="text-emerald-400 font-bold">+4%</span> nesta semana.
              Jogadores de rota superior estão dominando o Top 10.
            </p>
          </Card>
        </div>

        {/* Right Column: Ranking Table (Takes 2/3) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Classificação
              <span className="text-xs font-normal text-gray-500 bg-white/5 px-2 py-0.5 rounded ml-2">Top 100</span>
            </h3>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 w-full bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <RankingTable data={data} />
          )}
        </div>
      </div>

    </div>
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

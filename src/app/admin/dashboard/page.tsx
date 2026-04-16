"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";

interface Stats {
  total_users: number;
  active_7d: number;
  active_30d: number;
  total_messages: number;
  total_threads: number;
  new_today: number;
  new_week: number;
  new_month: number;
  usage_by_type: Record<string, number>;
  top_hero: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setLastRefreshed(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // 60 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  const StatCard = ({ title, value, subtitle }: { title: string, value: string | number, subtitle?: string }) => (
    <div className="bg-[#111] border border-white/5 rounded p-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#D4AF37]/10 to-transparent pointer-events-none" />
      <div className="font-[Orbitron] text-[10px] tracking-[2px] text-[#D4AF37] mb-2 uppercase opacity-80">{title}</div>
      <div className="font-[Cinzel_Decorative] text-4xl text-white group-hover:text-[#D4AF37] transition-colors">{value}</div>
      {subtitle && <div className="font-[Rajdhani] text-xs text-white/40 mt-2">{subtitle}</div>}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
        <div>
          <h1 className="font-[Orbitron] text-2xl font-bold tracking-[3px] text-white uppercase">
            EMPIRE COMMAND CENTER
          </h1>
          <p className="font-[Orbitron] text-[11px] tracking-[4px] text-[#D4AF37] mt-1 opacity-80">
            ✦ PLATFORM INTELLIGENCE
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 text-xs font-[Orbitron] tracking-[1px] text-white/50 hover:text-[#D4AF37] transition-colors bg-black/50 border border-white/10 px-3 py-2 rounded"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          {lastRefreshed.toLocaleTimeString()}
        </button>
      </div>

      {stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Users" value={stats.total_users.toLocaleString()} />
            <StatCard title="Active 7D" value={stats.active_7d.toLocaleString()} subtitle={`${((stats.active_7d / (stats.total_users || 1)) * 100).toFixed(1)}% of total`} />
            <StatCard title="Active 30D" value={stats.active_30d.toLocaleString()} />
            <StatCard title="Total Chats" value={stats.total_messages.toLocaleString()} subtitle={`${stats.total_threads.toLocaleString()} threads`} />
          </div>

          <h2 className="font-[Orbitron] text-[12px] tracking-[3px] text-white/50 pt-4 uppercase">Usage by Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Images Generated" value={(stats.usage_by_type['image_generation'] || 0).toLocaleString()} />
            <StatCard title="Videos Generated" value={(stats.usage_by_type['video_generation'] || 0).toLocaleString()} />
            <StatCard title="Websites Analyzed" value={(stats.usage_by_type['website_analysis'] || 0).toLocaleString()} />
            <StatCard title="Docs Processed" value={(stats.usage_by_type['document_analysis'] || 0).toLocaleString()} />
          </div>

          <h2 className="font-[Orbitron] text-[12px] tracking-[3px] text-white/50 pt-4 uppercase">Growth & Engagement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="New Today" value={stats.new_today.toLocaleString()} />
            <StatCard title="New This Week" value={stats.new_week.toLocaleString()} />
            <StatCard title="New This Month" value={stats.new_month.toLocaleString()} />
            <StatCard title="Top Hero" value={stats.top_hero.replace('_', ' ').toUpperCase()} />
          </div>
        </div>
      )}
    </div>
  );
}

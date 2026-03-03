"use client";

import { StatsResult } from "@/lib/statistics";
import { useI18n } from "@/lib/i18n";

function formatDate(d: string, months: readonly string[]) {
  const [y, m] = d.split("-");
  return `${months[parseInt(m) - 1]} ${y}`;
}

interface CardProps {
  title: string;
  value: string;
  subtitle: string;
  accent: string;
}

function Card({ title, value, subtitle, accent }: CardProps) {
  return (
    <div className="rounded-xl sm:rounded-2xl bg-white p-3 sm:p-5 shadow-sm border border-gray-100">
      <p className="text-xs sm:text-sm font-medium text-gray-500">{title}</p>
      <p className={`mt-1 sm:mt-2 text-xl sm:text-3xl font-bold ${accent}`}>{value}</p>
      <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-gray-400 truncate">{subtitle}</p>
    </div>
  );
}

export default function StatsCards({ stats }: { stats: StatsResult }) {
  const { t } = useI18n();
  const yoySign = stats.yoyChange >= 0 ? "+" : "";
  const yoyColor = stats.yoyChange >= 0 ? "text-red-600" : "text-green-600";
  const yoyArrow = stats.yoyChange >= 0 ? "↑" : "↓";

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
      <Card
        title={t.currentTariff}
        value={`${stats.current.value}¢`}
        subtitle={`${formatDate(stats.current.date, t.months)} · cents/kWh`}
        accent="text-blue-600"
      />
      <Card
        title={t.yoyChange}
        value={`${yoySign}${stats.yoyChange.toFixed(1)}%`}
        subtitle={`${yoyArrow} ${t.comparedToLastYear}`}
        accent={yoyColor}
      />
      <Card
        title={t.highestEver}
        value={`${stats.highest.value}¢`}
        subtitle={formatDate(stats.highest.date, t.months)}
        accent="text-orange-600"
      />
      <Card
        title={t.lowestEver}
        value={`${stats.lowest.value}¢`}
        subtitle={formatDate(stats.lowest.date, t.months)}
        accent="text-emerald-600"
      />
    </div>
  );
}

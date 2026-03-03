"use client";

import { useEffect, useState } from "react";
import { TariffDataPoint, fetchDomesticTariff } from "@/lib/parseCSV";
import {
  StatsResult,
  QuarterlyData,
  YoyData,
  computeStats,
  computeQuarterlyData,
  computeYoyData,
} from "@/lib/statistics";
import { useI18n } from "@/lib/i18n";
import StatsCards from "@/components/StatsCards";
import TariffChart from "@/components/TariffChart";
import QuarterlyChart from "@/components/QuarterlyChart";
import YoyChart from "@/components/YoyChart";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ShareButton from "@/components/ShareButton";

export default function Home() {
  const { t } = useI18n();
  const [data, setData] = useState<TariffDataPoint[] | null>(null);
  const [stats, setStats] = useState<StatsResult | null>(null);
  const [quarterly, setQuarterly] = useState<QuarterlyData[]>([]);
  const [yoy, setYoy] = useState<YoyData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDomesticTariff()
      .then((tariff) => {
        setData(tariff);
        setStats(computeStats(tariff));
        setQuarterly(computeQuarterlyData(tariff));
        setYoy(computeYoyData(tariff));
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">{t.loadingError}: {error}</p>
      </div>
    );
  }

  if (!data || !stats) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {t.loading}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm sm:text-lg">
                SG
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">
                  {t.title}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  {t.subtitle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShareButton />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8 lg:px-8 space-y-4 sm:space-y-6">
        <StatsCards stats={stats} />
        <TariffChart data={data} />
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <QuarterlyChart data={quarterly} />
          <YoyChart data={yoy} />
        </div>
        <footer className="text-center text-xs text-gray-400 pt-2 pb-6 sm:pt-4 sm:pb-8">
          {t.footer}
        </footer>
      </main>
    </div>
  );
}

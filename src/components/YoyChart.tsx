"use client";

import ReactECharts from "echarts-for-react";
import { YoyData } from "@/lib/statistics";
import { useI18n } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/useIsMobile";

interface Props {
  data: YoyData[];
}

export default function YoyChart({ data }: Props) {
  const { t } = useI18n();
  const isMobile = useIsMobile();

  const barData = data.map((d) => ({
    value: d.change,
    itemStyle: {
      color: d.change >= 0 ? "rgba(239,68,68,0.35)" : "rgba(16,185,129,0.35)",
      borderRadius: d.change >= 0 ? [2, 2, 0, 0] : [0, 0, 2, 2],
    },
  }));

  const option = {
    tooltip: {
      trigger: "axis" as const,
      backgroundColor: "rgba(255,255,255,0.95)",
      borderColor: "#e5e7eb",
      textStyle: { color: "#374151", fontSize: isMobile ? 11 : 13 },
      confine: true,
      formatter: (params: Array<{ axisValue: string; seriesName: string; value: number | null; color: string }>) => {
        const val = params.find((p) => p.value != null && p.seriesName === t.yoySeriesTrend);
        if (!val) return "";
        const sign = val.value! >= 0 ? "+" : "";
        return `<b>${val.axisValue}</b><br/>${t.yoyTooltipLabel}: <b>${sign}${val.value}%</b>`;
      },
    },
    grid: {
      left: isMobile ? 45 : 55,
      right: isMobile ? 10 : 20,
      top: isMobile ? 20 : 30,
      bottom: isMobile ? 55 : 70,
    },
    xAxis: {
      type: "category" as const,
      data: data.map((d) => d.date),
      axisLabel: {
        rotate: isMobile ? 55 : 45,
        fontSize: isMobile ? 9 : 11,
        formatter: (v: string) => {
          const [y, m] = v.split("-");
          return m === "01" ? y : "";
        },
      },
    },
    yAxis: {
      type: "value" as const,
      name: "%",
      nameTextStyle: { fontSize: isMobile ? 10 : 12 },
      splitLine: { lineStyle: { type: "dashed" as const, color: "#f3f4f6" } },
      axisLabel: {
        fontSize: isMobile ? 9 : 12,
        formatter: (v: number) => `${v > 0 ? "+" : ""}${v}%`,
      },
    },
    series: [
      {
        name: t.yoySeriesChange,
        type: "bar",
        data: barData,
        barMaxWidth: isMobile ? 3 : 5,
      },
      {
        name: t.yoySeriesTrend,
        type: "line",
        data: data.map((d) => d.change),
        smooth: true,
        symbol: "none",
        lineStyle: { width: isMobile ? 2 : 2.5, color: "#6366f1" },
        itemStyle: { color: "#6366f1" },
      },
    ],
  };

  return (
    <div className="rounded-xl sm:rounded-2xl bg-white p-3 sm:p-6 shadow-sm border border-gray-100">
      <h2 className="mb-2 sm:mb-4 text-base sm:text-lg font-semibold text-gray-800">
        {t.yoyTitle}
      </h2>
      <ReactECharts option={option} style={{ height: isMobile ? 260 : 320 }} notMerge lazyUpdate />
    </div>
  );
}

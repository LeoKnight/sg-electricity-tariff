"use client";

import ReactECharts from "echarts-for-react";
import { QuarterlyData } from "@/lib/statistics";
import { useI18n } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/useIsMobile";

interface Props {
  data: QuarterlyData[];
}

export default function QuarterlyChart({ data }: Props) {
  const { t } = useI18n();
  const isMobile = useIsMobile();

  const option = {
    tooltip: {
      trigger: "axis" as const,
      backgroundColor: "rgba(255,255,255,0.95)",
      borderColor: "#e5e7eb",
      textStyle: { color: "#374151", fontSize: isMobile ? 11 : 13 },
      confine: true,
      formatter: (params: Array<{ axisValue: string; value: number; color: string }>) => {
        const p = params[0];
        return `<b>${p.axisValue}</b><br/>${t.quarterlyTooltipLabel}: <b>${Number(p.value).toFixed(2)} ¢/kWh</b>`;
      },
    },
    grid: {
      left: isMobile ? 40 : 50,
      right: isMobile ? 10 : 20,
      top: isMobile ? 20 : 30,
      bottom: isMobile ? 55 : 70,
    },
    xAxis: {
      type: "category" as const,
      data: data.map((d) => d.quarter),
      axisLabel: {
        rotate: isMobile ? 55 : 45,
        fontSize: isMobile ? 9 : 11,
        interval: isMobile ? 5 : 3,
      },
    },
    yAxis: {
      type: "value" as const,
      name: "cents/kWh",
      nameTextStyle: { fontSize: isMobile ? 10 : 12, padding: [0, isMobile ? 20 : 40, 0, 0] },
      min: (v: { min: number }) => Math.floor(v.min - 2),
      splitLine: { lineStyle: { type: "dashed" as const, color: "#f3f4f6" } },
      axisLabel: { fontSize: isMobile ? 9 : 12, formatter: (v: number) => v.toFixed(2) },
    },
    series: [
      {
        type: "bar",
        data: data.map((d) => d.avg),
        barMaxWidth: isMobile ? 12 : 20,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: "linear" as const,
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "#6366f1" },
              { offset: 1, color: "#a5b4fc" },
            ],
          },
        },
      },
    ],
  };

  return (
    <div className="rounded-xl sm:rounded-2xl bg-white p-3 sm:p-6 shadow-sm border border-gray-100">
      <h2 className="mb-2 sm:mb-4 text-base sm:text-lg font-semibold text-gray-800">
        {t.quarterlyTitle}
      </h2>
      <ReactECharts option={option} style={{ height: isMobile ? 260 : 320 }} notMerge lazyUpdate />
    </div>
  );
}

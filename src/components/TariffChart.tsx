"use client";

import ReactECharts from "echarts-for-react";
import { TariffDataPoint } from "@/lib/parseCSV";
import { computeMovingAverage, generateForecast } from "@/lib/statistics";
import { useI18n } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/useIsMobile";

interface Props {
  data: TariffDataPoint[];
}

export default function TariffChart({ data }: Props) {
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const ma = computeMovingAverage(data, 6);
  const forecast = generateForecast(data, 6);

  const allDates = [
    ...data.map((d) => d.date),
    ...forecast.map((d) => d.date),
  ];

  const histValues = data.map((d) => d.value);

  const forecastValues: (number | null)[] = [
    ...new Array(data.length - 1).fill(null),
    data[data.length - 1].value,
    ...forecast.map((d) => d.value),
  ];

  const forecastLower: (number | null)[] = [
    ...new Array(data.length - 1).fill(null),
    data[data.length - 1].value,
    ...forecast.map((d) => parseFloat((d.value - 1.5).toFixed(2))),
  ];

  const bandWidth: (number | null)[] = [
    ...new Array(data.length - 1).fill(null),
    0,
    ...forecast.map(() => 3.0),
  ];

  const option = {
    tooltip: {
      trigger: "axis" as const,
      backgroundColor: "rgba(255,255,255,0.95)",
      borderColor: "#e5e7eb",
      textStyle: { color: "#374151", fontSize: isMobile ? 11 : 13 },
      confine: true,
      formatter: (params: Array<{ seriesName: string; value: number | null; axisValue: string; color: string }>) => {
        const date = params[0].axisValue;
        let html = `<div style="font-weight:600;margin-bottom:4px">${date}</div>`;
        for (const p of params) {
          if (p.value != null && p.seriesName !== "_lower" && p.seriesName !== "_band") {
            html += `<div style="display:flex;align-items:center;gap:6px">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color}"></span>
              ${p.seriesName}: <b>${p.value} ¢/kWh</b>
            </div>`;
          }
        }
        return html;
      },
    },
    legend: {
      data: [t.tariffSeriesName, t.movingAvg, t.forecastLabel],
      top: 0,
      textStyle: { fontSize: isMobile ? 10 : 13 },
      itemWidth: isMobile ? 16 : 25,
      itemGap: isMobile ? 8 : 10,
    },
    grid: {
      left: isMobile ? 40 : 50,
      right: isMobile ? 12 : 30,
      top: isMobile ? 40 : 50,
      bottom: isMobile ? 60 : 80,
    },
    dataZoom: [
      {
        type: "slider" as const,
        start: 0,
        end: 100,
        bottom: isMobile ? 4 : 10,
        height: isMobile ? 20 : 30,
        borderColor: "#e5e7eb",
        fillerColor: "rgba(59,130,246,0.08)",
        handleStyle: { color: "#3b82f6" },
      },
      { type: "inside" as const },
    ],
    xAxis: {
      type: "category" as const,
      data: allDates,
      axisLabel: {
        rotate: isMobile ? 50 : 45,
        fontSize: isMobile ? 9 : 11,
        formatter: (v: string) => {
          const [y, m] = v.split("-");
          return m === "01" ? y : "";
        },
      },
      axisTick: { alignWithLabel: true },
    },
    yAxis: {
      type: "value" as const,
      name: "cents/kWh",
      nameTextStyle: { fontSize: isMobile ? 10 : 12, padding: [0, isMobile ? 20 : 40, 0, 0] },
      min: (v: { min: number }) => Math.floor(v.min - 2),
      splitLine: { lineStyle: { type: "dashed" as const, color: "#f3f4f6" } },
      axisLabel: { fontSize: isMobile ? 9 : 12 },
    },
    series: [
      {
        name: t.tariffSeriesName,
        type: "line",
        data: [...histValues, ...new Array(forecast.length).fill(null)],
        smooth: false,
        symbol: "none",
        lineStyle: { width: isMobile ? 1.5 : 2, color: "#3b82f6" },
        itemStyle: { color: "#3b82f6" },
        areaStyle: {
          color: {
            type: "linear" as const,
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(59,130,246,0.15)" },
              { offset: 1, color: "rgba(59,130,246,0)" },
            ],
          },
        },
      },
      {
        name: t.movingAvg,
        type: "line",
        data: [...(ma as (number | null)[]), ...new Array(forecast.length).fill(null)],
        smooth: true,
        symbol: "none",
        lineStyle: { width: isMobile ? 1.5 : 2, color: "#f59e0b", type: "dashed" as const },
        itemStyle: { color: "#f59e0b" },
      },
      {
        name: t.forecastLabel,
        type: "line",
        data: forecastValues,
        smooth: false,
        symbol: "none",
        lineStyle: { width: isMobile ? 1.5 : 2, color: "#ef4444", type: "dotted" as const },
        itemStyle: { color: "#ef4444" },
      },
      {
        name: "_lower",
        type: "line",
        data: forecastLower,
        smooth: false,
        symbol: "none",
        lineStyle: { width: 0 },
        stack: "confidence",
        silent: true,
      },
      {
        name: "_band",
        type: "line",
        data: bandWidth,
        smooth: false,
        symbol: "none",
        lineStyle: { width: 0 },
        areaStyle: { color: "rgba(239,68,68,0.1)" },
        stack: "confidence",
        silent: true,
      },
    ],
  };

  return (
    <div className="rounded-xl sm:rounded-2xl bg-white p-3 sm:p-6 shadow-sm border border-gray-100">
      <h2 className="mb-2 sm:mb-4 text-base sm:text-lg font-semibold text-gray-800">
        {t.tariffTrendTitle}
      </h2>
      <ReactECharts
        option={option}
        style={{ height: isMobile ? 300 : 420 }}
        notMerge
        lazyUpdate
      />
      <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-gray-400 text-right">
        {t.tariffCaption}
      </p>
    </div>
  );
}

"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Locale = "zh" | "en";

interface Translations {
  title: string;
  subtitle: string;
  loadingError: string;
  loading: string;
  footer: string;

  currentTariff: string;
  yoyChange: string;
  highestEver: string;
  lowestEver: string;
  comparedToLastYear: string;
  months: readonly string[];

  tariffTrendTitle: string;
  tariffSeriesName: string;
  movingAvg: string;
  forecastLabel: string;
  tariffCaption: string;

  yoyTitle: string;
  yoyTooltipLabel: string;
  yoySeriesChange: string;
  yoySeriesTrend: string;

  quarterlyTitle: string;
  quarterlyTooltipLabel: string;

  share: string;
  shareTitle: string;
  shareDesc: string;
  copyLink: string;
  copied: string;
}

const translations: Record<Locale, Translations> = {
  zh: {
    title: "新加坡家庭电费趋势分析",
    subtitle: "新加坡家庭用电电价 · 2012 - 2026",
    loadingError: "加载数据失败",
    loading: "加载数据中...",
    footer: "数据来源: Energy Market Authority (EMA) Singapore · 单位: cents/kWh (含GST)",

    currentTariff: "当前电价",
    yoyChange: "同比变化",
    highestEver: "历史最高",
    lowestEver: "历史最低",
    comparedToLastYear: "与去年同月相比",
    months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],

    tariffTrendTitle: "家庭用电价格趋势",
    tariffSeriesName: "电价",
    movingAvg: "6月移动平均",
    forecastLabel: "趋势预测",
    tariffCaption: "红色虚线为基于近24个月线性回归的趋势预测，阴影区域为 ±1.5¢ 置信区间",

    yoyTitle: "同比变化率",
    yoyTooltipLabel: "同比变化",
    yoySeriesChange: "变化",
    yoySeriesTrend: "趋势",

    quarterlyTitle: "季度均价",
    quarterlyTooltipLabel: "季度均价",

    share: "分享",
    shareTitle: "分享此页面",
    shareDesc: "扫描二维码访问本页",
    copyLink: "复制链接",
    copied: "已复制！",
  },
  en: {
    title: "Singapore Electricity Tariff Trend",
    subtitle: "Domestic Electricity Tariff · 2012 - 2026",
    loadingError: "Failed to load data",
    loading: "Loading data...",
    footer: "Source: Energy Market Authority (EMA) Singapore · Unit: cents/kWh (incl. GST)",

    currentTariff: "Current Tariff",
    yoyChange: "YoY Change",
    highestEver: "All-Time High",
    lowestEver: "All-Time Low",
    comparedToLastYear: "vs. same month last year",
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],

    tariffTrendTitle: "Domestic Tariff Trend",
    tariffSeriesName: "Tariff",
    movingAvg: "6M Moving Avg",
    forecastLabel: "Forecast",
    tariffCaption: "Red dotted line: forecast based on 24-month linear regression; shaded area: ±1.5¢ confidence interval",

    yoyTitle: "Year-over-Year Change",
    yoyTooltipLabel: "YoY Change",
    yoySeriesChange: "Change",
    yoySeriesTrend: "Trend",

    quarterlyTitle: "Quarterly Average",
    quarterlyTooltipLabel: "Quarterly Avg",

    share: "Share",
    shareTitle: "Share This Page",
    shareDesc: "Scan QR code to visit this page",
    copyLink: "Copy Link",
    copied: "Copied!",
  },
};

interface I18nContextValue {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("locale") as Locale | null;
      if (saved === "zh" || saved === "en") return saved;
      return navigator.language.startsWith("zh") ? "zh" : "en";
    }
    return "zh";
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("locale", l);
    document.documentElement.lang = l === "zh" ? "zh-CN" : "en";
  }, []);

  return (
    <I18nContext.Provider value={{ locale, t: translations[locale], setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

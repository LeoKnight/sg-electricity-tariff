import { TariffDataPoint } from "./parseCSV";

export interface StatsResult {
  current: { value: number; date: string };
  yoyChange: number; // percentage
  highest: { value: number; date: string };
  lowest: { value: number; date: string };
  volatility: number; // std dev of last 12 months
}

export interface QuarterlyData {
  quarter: string; // e.g. "2024 Q1"
  avg: number;
}

export interface YoyData {
  date: string;
  change: number; // percentage
}

export function computeStats(data: TariffDataPoint[]): StatsResult {
  const current = data[data.length - 1];

  const currentMonth = current.date.slice(5);
  const lastYearDate = `${parseInt(current.date.slice(0, 4)) - 1}-${currentMonth}`;
  const lastYearPoint = data.find((d) => d.date === lastYearDate);
  const yoyChange = lastYearPoint
    ? ((current.value - lastYearPoint.value) / lastYearPoint.value) * 100
    : 0;

  let highest = data[0];
  let lowest = data[0];
  for (const d of data) {
    if (d.value > highest.value) highest = d;
    if (d.value < lowest.value) lowest = d;
  }

  const last12 = data.slice(-12).map((d) => d.value);
  const mean = last12.reduce((a, b) => a + b, 0) / last12.length;
  const variance =
    last12.reduce((sum, v) => sum + (v - mean) ** 2, 0) / last12.length;
  const volatility = Math.sqrt(variance);

  return {
    current: { value: current.value, date: current.date },
    yoyChange,
    highest: { value: highest.value, date: highest.date },
    lowest: { value: lowest.value, date: lowest.date },
    volatility,
  };
}

export function computeMovingAverage(
  data: TariffDataPoint[],
  window: number = 6
): (number | null)[] {
  return data.map((_, i) => {
    if (i < window - 1) return null;
    const slice = data.slice(i - window + 1, i + 1);
    return slice.reduce((s, d) => s + d.value, 0) / window;
  });
}

export function linearRegression(data: TariffDataPoint[], lookback: number = 24) {
  const recent = data.slice(-lookback);
  const n = recent.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += recent[i].value;
    sumXY += i * recent[i].value;
    sumX2 += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept, startIndex: data.length - lookback };
}

function addMonths(dateStr: string, months: number): string {
  const [y, m] = dateStr.split("-").map(Number);
  const total = y * 12 + (m - 1) + months;
  const newY = Math.floor(total / 12);
  const newM = (total % 12) + 1;
  return `${newY}-${String(newM).padStart(2, "0")}`;
}

export function generateForecast(
  data: TariffDataPoint[],
  months: number = 6
): TariffDataPoint[] {
  const { slope, intercept, startIndex } = linearRegression(data);
  const lastIndex = data.length - 1 - startIndex;
  const lastDate = data[data.length - 1].date;

  return Array.from({ length: months }, (_, i) => ({
    date: addMonths(lastDate, i + 1),
    value: parseFloat((intercept + slope * (lastIndex + i + 1)).toFixed(2)),
  }));
}

export function computeQuarterlyData(data: TariffDataPoint[]): QuarterlyData[] {
  const map = new Map<string, number[]>();

  for (const d of data) {
    const year = d.date.slice(0, 4);
    const month = parseInt(d.date.slice(5));
    const q = Math.ceil(month / 3);
    const key = `${year} Q${q}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(d.value);
  }

  return Array.from(map.entries()).map(([quarter, values]) => ({
    quarter,
    avg: parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)),
  }));
}

export function computeYoyData(data: TariffDataPoint[]): YoyData[] {
  const result: YoyData[] = [];

  for (let i = 12; i < data.length; i++) {
    const current = data[i];
    const prev = data[i - 12];
    const change = ((current.value - prev.value) / prev.value) * 100;
    result.push({
      date: current.date,
      change: parseFloat(change.toFixed(2)),
    });
  }

  return result;
}

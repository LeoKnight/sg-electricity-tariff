export interface TariffDataPoint {
  date: string; // YYYY-MM
  value: number;
}

const MONTH_MAP: Record<string, string> = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

function parseColumnDate(col: string): string {
  const year = col.slice(0, 4);
  const mon = col.slice(4);
  return `${year}-${MONTH_MAP[mon]}`;
}

export async function fetchDomesticTariff(): Promise<TariffDataPoint[]> {
  const res = await fetch("/data/ElectricityTariffMonthly.csv");
  const text = await res.text();
  const lines = text.trim().split("\n");

  const headers = lines[0].split(",");
  const dateColumns = headers.slice(1);

  const domesticLine = lines.find((l) =>
    l.startsWith("Low Tension Supplies - Domestic,")
  );
  if (!domesticLine) throw new Error("Domestic tariff data not found");

  const values = domesticLine.split(",").slice(1);

  const data: TariffDataPoint[] = dateColumns.map((col, i) => ({
    date: parseColumnDate(col),
    value: parseFloat(values[i]),
  }));

  data.reverse();

  const seen = new Set<string>();
  return data.filter((d) => {
    if (seen.has(d.date)) return false;
    seen.add(d.date);
    return true;
  });
}

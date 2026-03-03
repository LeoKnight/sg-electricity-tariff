"use client";

import { useI18n, Locale } from "@/lib/i18n";

const options: { value: Locale; label: string }[] = [
  { value: "zh", label: "中文" },
  { value: "en", label: "EN" },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5 text-sm">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setLocale(opt.value)}
          className={`rounded-md px-2.5 py-1 font-medium whitespace-nowrap transition-colors ${
            locale === opt.value
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

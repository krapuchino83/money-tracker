import type { WeatherAnimationKind } from "@/lib/open-meteo/types";

/** WMO Weather interpretation codes (Open-Meteo). */
const WMO_LABELS: Record<number, string> = {
  0: "Ясно",
  1: "Преимущественно ясно",
  2: "Переменная облачность",
  3: "Пасмурно",
  45: "Туман",
  48: "Изморозь",
  51: "Морось",
  53: "Морось",
  55: "Сильная морось",
  56: "Ледяная морось",
  57: "Ледяная морось",
  61: "Небольшой дождь",
  63: "Дождь",
  65: "Сильный дождь",
  66: "Ледяной дождь",
  67: "Ледяной дождь",
  71: "Небольшой снег",
  73: "Снег",
  75: "Сильный снег",
  77: "Снежная крупа",
  80: "Ливень",
  81: "Ливень",
  82: "Сильный ливень",
  85: "Снегопад",
  86: "Сильный снегопад",
  95: "Гроза",
  96: "Гроза с градом",
  99: "Гроза с градом",
};

const COMPASS = ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ"];

export function weatherCodeLabel(code: number): string {
  return WMO_LABELS[code] ?? "Неизвестно";
}

export function windDirLabel(degrees: number): string {
  if (degrees < 0) return "—";
  const idx = Math.round(degrees / 45) % 8;
  return COMPASS[idx] ?? "—";
}

export function animationKind(code: number, isDay: boolean): WeatherAnimationKind {
  if (code === 95 || code === 96 || code === 99) return "thunder";
  if (code === 56 || code === 57 || code === 66 || code === 67) return "sleet";
  if (
    code === 71 ||
    code === 73 ||
    code === 75 ||
    code === 77 ||
    code === 85 ||
    code === 86
  ) {
    return "snow";
  }
  if (
    code === 51 ||
    code === 53 ||
    code === 55 ||
    code === 61 ||
    code === 63 ||
    code === 65 ||
    code === 80 ||
    code === 81 ||
    code === 82
  ) {
    return "rain";
  }
  if (code === 3 || code === 45 || code === 48) return "cloudy";
  if (code === 1 || code === 2) return "partly-cloudy";
  return isDay ? "clear-day" : "clear-night";
}

/** Компактная иконка для ячеек прогноза. */
export function weatherCodeIcon(code: number, isDay = true): string {
  if (code === 95 || code === 96 || code === 99) return "⛈";
  if (code === 56 || code === 57 || code === 66 || code === 67) return "🌨";
  if (code === 71 || code === 73 || code === 75 || code === 77 || code === 85 || code === 86) {
    return "❄";
  }
  if (
    code === 51 ||
    code === 53 ||
    code === 55 ||
    code === 61 ||
    code === 63 ||
    code === 65 ||
    code === 80 ||
    code === 81 ||
    code === 82
  ) {
    return "🌧";
  }
  if (code === 45 || code === 48) return "🌫";
  if (code === 3) return "☁";
  if (code === 2) return "⛅";
  if (code === 1) return "🌤";
  return isDay ? "☀" : "🌙";
}

const WEEKDAY_SHORT = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export function weekdayShort(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return WEEKDAY_SHORT[d.getDay()] ?? "";
}

export function formatTemp(n: number): string {
  const rounded = Math.round(n);
  return `${rounded > 0 ? "+" : ""}${rounded}`;
}

export function formatTempPlain(n: number): string {
  return String(Math.round(n));
}

export function parseHourFromIso(iso: string): number {
  const part = iso.split("T")[1];
  return part ? Number(part.slice(0, 2)) : 0;
}

export function parseDateFromIso(iso: string): string {
  return iso.slice(0, 10);
}

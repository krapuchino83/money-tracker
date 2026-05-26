import { KERCH_WEATHER, OPEN_METEO_FORECAST_URL } from "@/lib/open-meteo/constants";
import { parseDateFromIso, parseHourFromIso } from "@/lib/open-meteo/labels";
import type { KerchWeatherData, OpenMeteoForecastResponse } from "@/lib/open-meteo/types";

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function normalizeResponse(raw: OpenMeteoForecastResponse): KerchWeatherData {
  if (raw.error) {
    throw new Error(raw.reason ?? "Open-Meteo error");
  }

  const todayDate = parseDateFromIso(raw.current.time);
  const currentHour = parseHourFromIso(raw.current.time);

  const todayHours = raw.hourly.time
    .map((time, i) => ({
      time,
      hour: parseHourFromIso(time),
      temp: Math.round(raw.hourly.temperature_2m[i] ?? 0),
      weatherCode: raw.hourly.weather_code[i] ?? 0,
    }))
    .filter((h) => parseDateFromIso(h.time) === todayDate);

  const daily = raw.daily.time.map((date, i) => ({
    date,
    tempMin: Math.round(raw.daily.temperature_2m_min[i] ?? 0),
    tempMax: Math.round(raw.daily.temperature_2m_max[i] ?? 0),
    weatherCode: raw.daily.weather_code[i] ?? 0,
  }));

  return {
    city: KERCH_WEATHER.city,
    timezone: raw.timezone,
    todayDate,
    currentHour,
    current: {
      time: raw.current.time,
      temp: Math.round(raw.current.temperature_2m),
      feelsLike: Math.round(raw.current.apparent_temperature),
      humidity: Math.round(raw.current.relative_humidity_2m),
      windSpeed: round1(raw.current.wind_speed_10m),
      windDirection: raw.current.wind_direction_10m,
      weatherCode: raw.current.weather_code,
      isDay: raw.current.is_day === 1,
    },
    todayHours,
    daily,
  };
}

/** Прогноз Open-Meteo для Керчи (7 дней + почасовой). Ключ API не нужен. */
export async function fetchKerchWeather(): Promise<KerchWeatherData> {
  const url = new URL(OPEN_METEO_FORECAST_URL);
  url.searchParams.set("latitude", String(KERCH_WEATHER.lat));
  url.searchParams.set("longitude", String(KERCH_WEATHER.lon));
  url.searchParams.set("timezone", KERCH_WEATHER.timezone);
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("wind_speed_unit", "ms");
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "weather_code",
      "wind_speed_10m",
      "wind_direction_10m",
    ].join(","),
  );
  url.searchParams.set("hourly", "temperature_2m,weather_code");
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min",
  );

  const res = await fetch(url, { next: { revalidate: 1800 } });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Open-Meteo ${res.status}: ${text.slice(0, 120)}`);
  }

  const raw = (await res.json()) as OpenMeteoForecastResponse;
  return normalizeResponse(raw);
}

"use client";

import { useState } from "react";

import { WeatherAnimation } from "@/components/weather/weather-animation";
import { Button } from "@/components/ui/button";
import {
  animationKind,
  formatTemp,
  weatherCodeIcon,
  weatherCodeLabel,
  weekdayShort,
  windDirLabel,
} from "@/lib/open-meteo/labels";
import type { KerchWeatherData, WeatherDay, WeatherHour } from "@/lib/open-meteo/types";
import { cn } from "@/lib/utils";

type ViewMode = "hours" | "week";

/** Общая высота области прогноза для обеих вкладок. */
const FORECAST_PANEL_CLASS = "relative h-[7.75rem] w-full";

const FORECAST_GRID_BASE =
  "absolute inset-0 grid h-full gap-1 transition-opacity duration-200";

const SLOT_BASE =
  "flex h-full min-h-0 flex-col items-center justify-center gap-0.5 rounded-lg border px-0.5 py-1 text-center";

type Props = {
  weather: KerchWeatherData | null;
  error?: string | null;
};

function slotClass(active: boolean) {
  return cn(
    SLOT_BASE,
    active
      ? "border-primary/45 bg-primary/12 text-foreground ring-1 ring-primary/20"
      : "border-border/45 bg-background/55 text-muted-foreground",
  );
}

function HourSlot({ hour, active }: { hour: WeatherHour; active: boolean }) {
  const isDay = hour.hour >= 6 && hour.hour < 21;

  return (
    <div className={slotClass(active)} title={weatherCodeLabel(hour.weatherCode)}>
      <span className="text-[9px] font-medium leading-none tabular-nums">
        {String(hour.hour).padStart(2, "0")}
      </span>
      <span className="text-base leading-none" aria-hidden>
        {weatherCodeIcon(hour.weatherCode, isDay)}
      </span>
      <span
        className={cn(
          "text-[11px] font-semibold leading-none tabular-nums",
          active ? "text-foreground" : "text-foreground/85",
        )}
      >
        {hour.temp}°
      </span>
    </div>
  );
}

function DaySlot({
  day,
  today,
  todayDate,
}: {
  day: WeatherDay;
  today: boolean;
  todayDate: string;
}) {
  const label = day.date === todayDate ? "Сег" : weekdayShort(day.date);

  return (
    <div
      className={slotClass(today)}
      title={`${weatherCodeLabel(day.weatherCode)} · ${day.tempMin}°…${day.tempMax}°`}
    >
      <span className="text-[9px] font-medium leading-none uppercase">{label}</span>
      <span className="text-base leading-none" aria-hidden>
        {weatherCodeIcon(day.weatherCode, true)}
      </span>
      <span className="text-[11px] font-semibold leading-none tabular-nums text-foreground">
        {day.tempMax}°
      </span>
      <span className="text-[9px] leading-none tabular-nums opacity-70">{day.tempMin}°</span>
    </div>
  );
}

export function WeatherWidget({ weather, error }: Props) {
  const [view, setView] = useState<ViewMode>("hours");

  if (!weather) {
    return (
      <section
        aria-label="Погода в Керчи"
        className="mb-8 rounded-2xl border border-border/60 bg-card/70 px-4 py-3 backdrop-blur-sm md:px-5"
      >
        <p className="text-muted-foreground text-[10px] font-medium tracking-[0.16em] uppercase">
          Погода · Керчь
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          {error ?? "Не удалось загрузить прогноз Open-Meteo."}
        </p>
      </section>
    );
  }

  const { current } = weather;
  const kind = animationKind(current.weatherCode, current.isDay);

  return (
    <section
      aria-label={`Погода в ${weather.city}`}
      className="mb-8 rounded-2xl border border-border/60 bg-card/70 px-4 py-3 backdrop-blur-sm md:px-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-5">
        {/* Текущая погода */}
        <div className="flex shrink-0 items-center gap-4 sm:gap-5 lg:min-w-[15rem] lg:max-w-[18rem]">
          <WeatherAnimation kind={kind} />
          <div className="min-w-0">
            <p className="text-muted-foreground text-[10px] font-medium tracking-[0.16em] uppercase">
              Погода · {weather.city}
            </p>
            <p className="font-display mt-0.5 text-3xl tabular-nums md:text-4xl">
              {formatTemp(current.temp)}°
            </p>
            <p className="text-sm font-medium">{weatherCodeLabel(current.weatherCode)}</p>
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
              Ощущается {formatTemp(current.feelsLike)}° · {current.windSpeed} м/с{" "}
              {windDirLabel(current.windDirection)} · {current.humidity}%
            </p>
          </div>
        </div>

        {/* Прогноз */}
        <div className="flex min-w-0 flex-1 flex-col rounded-xl border border-border/50 bg-muted/25 p-3">
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
              Прогноз
            </p>
            <div
              className="inline-flex shrink-0 rounded-full border border-border/60 bg-background/70 p-0.5"
              role="tablist"
              aria-label="Режим прогноза"
            >
              <Button
                type="button"
                role="tab"
                aria-selected={view === "hours"}
                variant={view === "hours" ? "secondary" : "ghost"}
                size="xs"
                className="h-6 rounded-full px-2.5 text-[11px]"
                onClick={() => setView("hours")}
              >
                По часам
              </Button>
              <Button
                type="button"
                role="tab"
                aria-selected={view === "week"}
                variant={view === "week" ? "secondary" : "ghost"}
                size="xs"
                className="h-6 rounded-full px-2.5 text-[11px]"
                onClick={() => setView("week")}
              >
                На неделю
              </Button>
            </div>
          </div>

          <div className={FORECAST_PANEL_CLASS}>
            {/* 24 часа: 6×4 → 8×3 → 12×2 без прокрутки */}
            <div
              className={cn(
                FORECAST_GRID_BASE,
                "grid-cols-6 grid-rows-4 sm:grid-cols-8 sm:grid-rows-3 md:grid-cols-12 md:grid-rows-2",
                view === "hours" ? "opacity-100" : "pointer-events-none opacity-0",
              )}
              aria-hidden={view !== "hours"}
            >
              {weather.todayHours.length > 0 ? (
                weather.todayHours.map((h) => (
                  <HourSlot
                    key={h.time}
                    hour={h}
                    active={h.hour === weather.currentHour}
                  />
                ))
              ) : (
                <p className="text-muted-foreground col-span-full self-center text-center text-sm">
                  Почасовой прогноз недоступен
                </p>
              )}
            </div>

            {/* 7 дней: одна строка, та же высота панели */}
            <div
              className={cn(
                FORECAST_GRID_BASE,
                "grid-cols-7 grid-rows-1",
                view === "week" ? "opacity-100" : "pointer-events-none opacity-0",
              )}
              aria-hidden={view !== "week"}
            >
              {weather.daily.map((day) => (
                <DaySlot
                  key={day.date}
                  day={day}
                  today={day.date === weather.todayDate}
                  todayDate={weather.todayDate}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

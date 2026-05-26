"use client";

import type { WeatherAnimationKind } from "@/lib/open-meteo/types";
import { cn } from "@/lib/utils";

type Props = {
  kind: WeatherAnimationKind;
  className?: string;
};

function RainDrops() {
  return (
    <>
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          className="weather-drop"
          style={{
            left: `${(i * 5.7 + 3) % 100}%`,
            animationDelay: `${(i * 0.17) % 1.4}s`,
            animationDuration: `${0.55 + (i % 5) * 0.08}s`,
          }}
        />
      ))}
    </>
  );
}

function Snowflakes() {
  return (
    <>
      {Array.from({ length: 16 }).map((_, i) => (
        <span
          key={i}
          className="weather-snowflake"
          style={{
            left: `${(i * 6.5 + 2) % 100}%`,
            animationDelay: `${(i * 0.25) % 2}s`,
            animationDuration: `${2.2 + (i % 4) * 0.35}s`,
            fontSize: `${6 + (i % 3) * 2}px`,
          }}
        >
          ❄
        </span>
      ))}
    </>
  );
}

function Clouds({ dense = false }: { dense?: boolean }) {
  return (
    <>
      <span className={cn("weather-cloud weather-cloud-1", dense && "opacity-90")} />
      <span className={cn("weather-cloud weather-cloud-2", dense && "scale-110 opacity-95")} />
      {!dense && <span className="weather-cloud weather-cloud-3 opacity-70" />}
    </>
  );
}

function Sun() {
  return (
    <>
      <span className="weather-sun" />
      <span className="weather-sun-rays" />
    </>
  );
}

function Moon() {
  return <span className="weather-moon" />;
}

function Lightning() {
  return <span className="weather-lightning" aria-hidden />;
}

export function WeatherAnimation({ kind, className }: Props) {
  const isNight = kind === "clear-night";
  const showRain = kind === "rain" || kind === "thunder" || kind === "sleet";
  const showSnow = kind === "snow" || kind === "sleet";
  const showClouds =
    kind === "partly-cloudy" ||
    kind === "cloudy" ||
    kind === "rain" ||
    kind === "snow" ||
    kind === "sleet" ||
    kind === "thunder";
  const denseClouds = kind === "cloudy" || kind === "thunder" || kind === "rain";

  return (
    <div
      className={cn(
        "weather-scene relative h-[88px] w-[120px] shrink-0 overflow-hidden rounded-xl",
        isNight && "weather-scene--night",
        className,
      )}
      aria-hidden
    >
      {kind === "clear-day" && <Sun />}
      {isNight && <Moon />}
      {showClouds && <Clouds dense={denseClouds} />}
      {showRain && <RainDrops />}
      {showSnow && <Snowflakes />}
      {kind === "thunder" && <Lightning />}
    </div>
  );
}

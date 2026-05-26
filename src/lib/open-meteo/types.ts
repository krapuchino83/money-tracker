export type WeatherAnimationKind =
  | "clear-day"
  | "clear-night"
  | "partly-cloudy"
  | "cloudy"
  | "rain"
  | "snow"
  | "sleet"
  | "thunder";

export type WeatherCurrent = {
  time: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  isDay: boolean;
};

export type WeatherHour = {
  time: string;
  hour: number;
  temp: number;
  weatherCode: number;
};

export type WeatherDay = {
  date: string;
  tempMin: number;
  tempMax: number;
  weatherCode: number;
};

/** Нормализованные данные погоды для виджета. */
export type KerchWeatherData = {
  city: string;
  timezone: string;
  todayDate: string;
  currentHour: number;
  current: WeatherCurrent;
  todayHours: WeatherHour[];
  daily: WeatherDay[];
};

type OpenMeteoCurrent = {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  weather_code: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
};

export type OpenMeteoForecastResponse = {
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_abbreviation: string;
  current: OpenMeteoCurrent;
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
  error?: boolean;
  reason?: string;
};

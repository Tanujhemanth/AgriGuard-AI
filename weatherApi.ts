import { WeatherData, HourlyForecast, LocationData } from '@/types';

// WMO Weather interpretation codes
function decodeWmoWeather(code: number): string {
  if (code === 0) return 'Clear Sky';
  if (code === 1 || code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 55) return 'Light Drizzle';
  if (code >= 61 && code <= 65) return 'Rain Showers';
  if (code >= 71 && code <= 77) return 'Snow Flurry';
  if (code >= 80 && code <= 82) return 'Heavy Rain Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Cloudy / Humid';
}

function decodeWindDirection(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(deg / 45) % 8] || 'N';
}

// In-memory weather cache (2 minutes TTL)
const weatherCache = new Map<string, { timestamp: number; data: WeatherData }>();

export async function fetchLiveWeather(location: LocationData): Promise<WeatherData> {
  const lat = location.latitude || 16.3067;
  const lon = location.longitude || 80.4365;
  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;

  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 120000) {
    return cached.data;
  }

  const locationName = location.displayName || (location.district ? `${location.village || 'Field'}, ${location.district}` : `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`);

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m,weather_code&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,wind_speed_10m,wind_direction_10m,weather_code,uv_index&forecast_days=2&timezone=auto`;

    const res = await fetch(url, { cache: 'no-store' });
    
    if (!res.ok) {
      throw new Error(`Weather API returned HTTP ${res.status}`);
    }

    const data = await res.json();
    const current = data.current || {};
    const hourly = data.hourly || {};

    const currentTempC = Math.round(current.temperature_2m ?? 28);
    const humidityPct = Math.round(current.relative_humidity_2m ?? 72);
    const precipitationMm = current.precipitation ?? 0;
    const windSpeedKmH = Math.round(current.wind_speed_10m ?? 12);
    const windDirDeg = current.wind_direction_10m ?? 45;
    const windDirection = decodeWindDirection(windDirDeg);
    const weatherCode = current.weather_code ?? 2;
    const conditionText = decodeWmoWeather(weatherCode);

    // Build 24-hour forecast
    const hourlyForecast: HourlyForecast[] = [];
    const times: string[] = hourly.time || [];
    const temps: number[] = hourly.temperature_2m || [];
    const humidities: number[] = hourly.relative_humidity_2m || [];
    const rainProbs: number[] = hourly.precipitation_probability || [];
    const precipMms: number[] = hourly.precipitation || [];
    const winds: number[] = hourly.wind_speed_10m || [];
    const windDirs: number[] = hourly.wind_direction_10m || [];
    const codes: number[] = hourly.weather_code || [];

    let next24hPrecipTotalMm = 0;
    let maxWindSpeed24h = windSpeedKmH;

    let nextRainEvent: { timeLabel: string; prob: number; precipMm: number } | null = null;
    let highHumidityPeriod: { timeLabel: string; humidity: number } | null = null;
    let suitableWindow: { timeWindow: string; reason: string } | null = null;

    for (let i = 0; i < Math.min(24, times.length); i++) {
      const timeStr = times[i];
      const hourDate = new Date(timeStr);
      const hourVal = hourDate.getHours();
      const hourLabel = `${hourVal.toString().padStart(2, '0')}:00`;

      const temp = Math.round(temps[i] ?? currentTempC);
      const hum = Math.round(humidities[i] ?? humidityPct);
      const rainProb = rainProbs[i] ?? (i < 6 ? 45 : 15);
      const precip = precipMms[i] ?? 0;
      const wind = Math.round(winds[i] ?? windSpeedKmH);
      const wdir = decodeWindDirection(windDirs[i] ?? windDirDeg);
      const cond = decodeWmoWeather(codes[i] ?? 0);

      next24hPrecipTotalMm += precip;
      if (wind > maxWindSpeed24h) maxWindSpeed24h = wind;

      if (!nextRainEvent && (rainProb >= 45 || precip > 0.3)) {
        nextRainEvent = { timeLabel: hourLabel, prob: rainProb, precipMm: precip };
      }

      if (!highHumidityPeriod && hum >= 80) {
        highHumidityPeriod = { timeLabel: hourLabel, humidity: hum };
      }

      // Determine safety for spraying
      let isSafe = true;
      let spraySafetyReason = 'Favorable temperature, low drift risk (<15 km/h), and dry forecast.';

      if (wind > 15) {
        isSafe = false;
        spraySafetyReason = `High wind speed (${wind} km/h) creates airborne chemical drift risk.`;
      } else if (rainProb > 40 || precip > 0.5) {
        isSafe = false;
        spraySafetyReason = `High rain probability (${rainProb}%) risks washing off chemical treatments.`;
      } else if (temp > 33) {
        isSafe = false;
        spraySafetyReason = `Extreme ambient heat (${temp}°C) causes droplet evaporation and leaf scorching.`;
      }

      if (isSafe && !suitableWindow) {
        suitableWindow = {
          timeWindow: `Around ${hourLabel} (${temp}°C, Wind ${wind} km/h, Rain ${rainProb}%)`,
          reason: 'Calm winds and clear sky forecast.',
        };
      }

      hourlyForecast.push({
        time: timeStr,
        hourLabel,
        tempC: temp,
        humidityPct: hum,
        rainProb,
        precipMm: precip,
        windSpeedKmH: wind,
        windDirection: wdir,
        condition: cond,
        isSafeForSpraying: isSafe,
        spraySafetyReason,
      });
    }

    const currentRainProb = hourlyForecast[0]?.rainProb || (precipitationMm > 0 ? 90 : 25);
    const isRainExpectedSoon = hourlyForecast.slice(0, 6).some((h) => h.rainProb >= 50 || h.precipMm > 0.8);
    const isHighWindExpected = hourlyForecast.slice(0, 6).some((h) => h.windSpeedKmH >= 18);

    const weatherResult: WeatherData = {
      currentTempC,
      humidityPct,
      precipitationMm,
      rainProbabilityPct: currentRainProb,
      windSpeedKmH,
      windDirection,
      conditionText,
      uvIndex: hourly.uv_index?.[0] ?? 6,
      locationName,
      hourlyForecast,
      next24hPrecipTotalMm: Math.round(next24hPrecipTotalMm * 10) / 10,
      maxWindSpeed24h,
      isRainExpectedSoon,
      isHighWindExpected,
      isLive: true,
      lastFetchedAt: new Date().toLocaleTimeString(),
      nextRainEvent,
      highHumidityPeriod,
      suitableWindow,
    };

    weatherCache.set(cacheKey, { timestamp: Date.now(), data: weatherResult });
    return weatherResult;
  } catch (error) {
    console.warn('Live weather API timeout or network issue, using regional fallback:', error);
    return generateFallbackWeather(locationName);
  }
}

function generateFallbackWeather(locationName: string): WeatherData {
  const currentTempC = 29;
  const humidityPct = 76;
  const precipitationMm = 0.8;
  const rainProbabilityPct = 55;
  const windSpeedKmH = 13;
  const conditionText = 'High Humidity & Passing Showers';

  const hourlyForecast: HourlyForecast[] = Array.from({ length: 24 }).map((_, i) => {
    const hour = (new Date().getHours() + i) % 24;
    const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
    const rainProb = i < 4 ? 60 - i * 10 : 20;
    const wind = i > 3 && i < 10 ? 11 : 16;
    const isSafe = rainProb < 40 && wind < 15;

    return {
      time: new Date(Date.now() + i * 3600000).toISOString(),
      hourLabel,
      tempC: Math.round(26 + Math.sin(i / 4) * 4),
      humidityPct: 75 + Math.round(Math.cos(i / 3) * 10),
      rainProb,
      precipMm: rainProb > 50 ? 1.2 : 0,
      windSpeedKmH: wind,
      windDirection: 'NE',
      condition: rainProb > 50 ? 'Light Rain' : 'Partly Cloudy',
      isSafeForSpraying: isSafe,
      spraySafetyReason: isSafe
        ? 'Optimal conditions: calm winds & dry forecast'
        : rainProb > 50
        ? 'Rain imminent - risk of chemical wash-off'
        : 'Wind drift exceeds safe threshold (>15 km/h)',
    };
  });

  return {
    currentTempC,
    humidityPct,
    precipitationMm,
    rainProbabilityPct,
    windSpeedKmH,
    windDirection: 'NE',
    conditionText,
    uvIndex: 6,
    locationName,
    hourlyForecast,
    next24hPrecipTotalMm: 3.6,
    maxWindSpeed24h: 17,
    isRainExpectedSoon: true,
    isHighWindExpected: false,
    isLive: false,
    lastFetchedAt: new Date().toLocaleTimeString(),
    nextRainEvent: { timeLabel: '14:00', prob: 65, precipMm: 1.5 },
    highHumidityPeriod: { timeLabel: '18:00', humidity: 85 },
    suitableWindow: { timeWindow: 'Tomorrow 06:00 AM - 09:00 AM', reason: 'Calm winds and low rain risk.' },
  };
}

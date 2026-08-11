'use client';

import React from 'react';
import {
  CloudSun,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  ShieldCheck,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { WeatherData } from '@/types';

interface LiveWeatherCardProps {
  weather: WeatherData;
}

export const LiveWeatherCard: React.FC<LiveWeatherCardProps> = ({ weather }) => {
  return (
    <div className="glass-card p-5 lg:p-7 space-y-6 border-2 border-emerald-500/30 shadow-2xl relative overflow-hidden">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
            Live Meteorological Signals
          </span>
          <h3 className="text-xl font-black text-white flex items-center gap-2 font-heading">
            <CloudSun className="w-5 h-5 text-emerald-400" /> Micro-Climate & 24-Hour Forecast
          </h3>
        </div>
        <div className="text-right text-xs text-emerald-300/80">
          Location: <span className="font-bold text-white">{weather.locationName}</span>
        </div>
      </div>

      {/* Current Meteorological Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Temperature */}
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/20 space-y-1 shadow">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-bold text-emerald-300/80 uppercase font-mono">Temperature</span>
            <Thermometer className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white font-heading">{weather.currentTempC}°C</p>
          <p className="text-[10px] text-emerald-400/70">Ambient Foliar Heat</p>
        </div>

        {/* Relative Humidity */}
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/20 space-y-1 shadow">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-bold text-emerald-300/80 uppercase font-mono">Humidity</span>
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white font-heading">{weather.humidityPct}%</p>
          <p className="text-[10px] text-emerald-400/70">Fungal Moisture Risk</p>
        </div>

        {/* Rain Probability */}
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/20 space-y-1 shadow">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-bold text-emerald-300/80 uppercase font-mono">Rain Prob</span>
            <CloudRain className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white font-heading">{weather.rainProbabilityPct}%</p>
          <p className="text-[10px] text-emerald-400/70">Wash-off Probability</p>
        </div>

        {/* Wind Speed */}
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/20 space-y-1 shadow">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-bold text-emerald-300/80 uppercase font-mono">Wind Speed</span>
            <Wind className="w-4 h-4 text-emerald-300" />
          </div>
          <p className="text-2xl font-black text-white font-heading">{weather.windSpeedKmH} <span className="text-xs font-normal">km/h</span></p>
          <p className="text-[10px] text-emerald-400/70">Chemical Drift Factor</p>
        </div>

        {/* Weather Condition */}
        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/20 space-y-1 flex flex-col justify-between shadow">
          <span className="text-[11px] font-bold text-emerald-300/80 uppercase font-mono">Sky Condition</span>
          <p className="text-sm font-extrabold text-amber-300 truncate">{weather.conditionText}</p>
          <p className="text-[10px] text-emerald-400/70">UV Index: {weather.uvIndex}</p>
        </div>
      </div>

      {/* 24-Hour Spray Suitability Forecast Timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold text-emerald-200 uppercase tracking-wide flex items-center gap-1.5 font-heading">
            <Clock className="w-4 h-4 text-amber-400" /> 24-Hour Spray Safety Matrix
          </h4>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow" /> Favorable Spray Window
            </span>
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow" /> High Wind / Rain Risk
            </span>
          </div>
        </div>

        {/* Scrollable Hourly Forecast Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
          {weather.hourlyForecast.slice(0, 16).map((item, index) => (
            <div
              key={index}
              className={`min-w-[98px] p-3 rounded-xl border text-center transition flex-shrink-0 flex flex-col justify-between shadow ${
                item.isSafeForSpraying
                  ? 'border-emerald-500/40 bg-emerald-950/80 text-emerald-100 hover:border-emerald-400'
                  : 'border-amber-500/40 bg-amber-950/50 text-amber-200 hover:border-amber-400'
              }`}
            >
              <span className="text-[11px] font-bold text-white block font-mono">{item.hourLabel}</span>
              
              <div className="my-1.5 flex flex-col items-center">
                <span className="text-xs font-black">{item.tempC}°C</span>
                <span className="text-[10px] text-cyan-300 font-semibold mt-0.5">
                  🌧️ {item.rainProb}%
                </span>
                <span className="text-[10px] text-emerald-300/80 font-mono mt-0.5">
                  💨 {item.windSpeedKmH}k/h
                </span>
              </div>

              <div className="mt-1 pt-1 border-t border-emerald-500/20">
                {item.isSafeForSpraying ? (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-emerald-400">
                    <ShieldCheck className="w-3 h-3" /> SAFE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-amber-400">
                    <AlertTriangle className="w-3 h-3" /> WAIT
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

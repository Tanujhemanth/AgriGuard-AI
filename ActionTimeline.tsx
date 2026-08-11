'use client';

import React from 'react';
import { Clock, AlertTriangle, ShieldCheck, CloudRain, Wind, Thermometer, ChevronRight } from 'lucide-react';
import { WeatherData, DecisionEngineOutput } from '@/types';

interface ActionTimelineProps {
  weather: WeatherData;
  advisory: DecisionEngineOutput;
}

export const ActionTimeline: React.FC<ActionTimelineProps> = ({ weather, advisory }) => {
  const { hourlyForecast, nextRainEvent, suitableWindow } = weather;

  return (
    <div className="glass-card p-5 lg:p-6 space-y-4 border-2 border-emerald-500/30">
      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Step 7 — Weather-Aware Action Timeline</span>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" /> Agronomic Spraying & Treatment Window Matrix
          </h3>
        </div>
        <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-950 text-amber-300 border border-emerald-500/30">
          {advisory.action_status}
        </span>
      </div>

      {/* Visual Timeline Nodes */}
      <div className="relative pl-6 space-y-6 border-l-2 border-emerald-500/30 py-2">
        {/* Node 1: NOW */}
        <div className="relative">
          <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-emerald-950 shadow-lg shadow-emerald-500/50" />
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-300 uppercase">NOW — Current Conditions</span>
              <span className="text-[10px] text-emerald-400/70 font-mono">{new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-white">
              <span className="flex items-center gap-1"><Thermometer className="w-3.5 h-3.5 text-amber-400" /> {weather.currentTempC}°C</span>
              <span className="flex items-center gap-1"><CloudRain className="w-3.5 h-3.5 text-cyan-400" /> Rain Prob: {weather.rainProbabilityPct}%</span>
              <span className="flex items-center gap-1"><Wind className="w-3.5 h-3.5 text-emerald-300" /> Wind: {weather.windSpeedKmH} km/h ({weather.windDirection})</span>
            </div>
          </div>
        </div>

        {/* Node 2: EXPECTED WEATHER EVENT */}
        <div className="relative">
          <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-emerald-950 ${
            nextRainEvent || weather.isHighWindExpected ? 'bg-amber-500 shadow-amber-500/50' : 'bg-emerald-400'
          }`} />
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-amber-300 uppercase">
                {nextRainEvent ? `Rain Forecast Alert (${nextRainEvent.timeLabel})` : 'Atmospheric Risk Factor'}
              </span>
              <span className="text-[10px] text-amber-400 font-mono font-bold">
                {nextRainEvent ? `${nextRainEvent.prob}% Rain Probability` : 'Calm Atmospheric Window'}
              </span>
            </div>
            <p className="text-xs text-emerald-200">
              {nextRainEvent
                ? `Imminent rainfall (${nextRainEvent.precipMm}mm) creates pesticide wash-off hazard.`
                : 'No severe rainfall wash-off front detected in the next 6 hours.'}
            </p>
          </div>
        </div>

        {/* Node 3: REASSESSMENT POINT */}
        <div className="relative">
          <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-blue-500 border-2 border-emerald-950 shadow-lg shadow-blue-500/50" />
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/30 space-y-1">
            <span className="text-xs font-extrabold text-blue-300 uppercase">Field Reassessment Point</span>
            <p className="text-xs text-emerald-200">
              {advisory.action_status === 'WAIT'
                ? 'Re-check weather signals after rain passes; confirm foliage has dried prior to spraying.'
                : 'Re-inspect foliage in 24-48 hours to measure treatment efficacy.'}
            </p>
          </div>
        </div>

        {/* Node 4: POTENTIAL SUITABLE WINDOW */}
        <div className="relative">
          <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-emerald-950 shadow-lg shadow-emerald-400/50 animate-pulse" />
          <div className="p-3 rounded-xl bg-emerald-900/60 border border-emerald-500/40 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-300 uppercase flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Optimal Treatment Window
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                RECOMMENDED
              </span>
            </div>
            <p className="text-xs font-bold text-white">
              {suitableWindow?.timeWindow || advisory.timing_guidance.suggestedTimeWindow}
            </p>
            <p className="text-[11px] text-emerald-300/80">
              {suitableWindow?.reason || 'Favorable low-wind, low-rain probability microclimate.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

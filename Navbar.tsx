'use client';

import React from 'react';
import { Leaf, ShieldCheck, MapPin, CloudSun, Globe, History, Sparkles } from 'lucide-react';
import { LocationData, WeatherData } from '@/types';

interface NavbarProps {
  location: LocationData | null;
  weather: WeatherData | null;
  language: string;
  onLanguageChange: (lang: string) => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  location,
  weather,
  language,
  onLanguageChange,
  onOpenHistory,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-card border-b border-emerald-500/20 bg-emerald-950/80 backdrop-blur-md px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-amber-500 p-0.5 shadow-lg shadow-emerald-900/40">
            <div className="w-full h-full bg-emerald-950 rounded-[10px] flex items-center justify-center">
              <Leaf className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                AgriGuard <span className="text-amber-400">AI</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Hackathon Edition
              </span>
            </div>
            <p className="text-xs text-emerald-300/70 hidden sm:block">
              Real-time Field Diagnosis & Climate-Smart Agronomic Advisory
            </p>
          </div>
        </div>

        {/* Live Signals & Action Controls */}
        <div className="flex items-center gap-3">
          {/* Location Signal Badge */}
          {location && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/40 border border-emerald-500/20 text-xs text-emerald-200">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium truncate max-w-[140px]">
                {location.city || `${location.latitude.toFixed(2)}°, ${location.longitude.toFixed(2)}°`}
              </span>
            </div>
          )}

          {/* Weather Signal Badge */}
          {weather && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-900/40 border border-emerald-500/20 text-xs text-emerald-200">
              <CloudSun className="w-3.5 h-3.5 text-emerald-400" />
              <span>{weather.currentTempC}°C</span>
              <span className="text-emerald-400/60">•</span>
              <span>{weather.rainProbabilityPct}% Rain</span>
            </div>
          )}

          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-emerald-900/60 border border-emerald-500/30 rounded-lg p-1">
            <Globe className="w-3.5 h-3.5 text-emerald-400 ml-1 hidden sm:block" />
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-transparent text-xs text-emerald-200 focus:outline-none cursor-pointer font-medium px-1 py-0.5"
            >
              <option value="en" className="bg-emerald-950 text-white">English</option>
              <option value="te" className="bg-emerald-950 text-white">తెలుగు (Telugu)</option>
              <option value="hi" className="bg-emerald-950 text-white">हिन्दी (Hindi)</option>
              <option value="es" className="bg-emerald-950 text-white">Español</option>
            </select>
          </div>

          {/* History Drawer Toggle Button */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800/40 hover:bg-emerald-800/60 border border-emerald-500/30 text-xs font-medium text-emerald-200 transition"
            title="View Past Scans"
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-emerald-950 text-[10px] font-bold flex items-center justify-center">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

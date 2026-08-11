'use client';

import React from 'react';
import { Activity, ShieldCheck, AlertOctagon, Bug, CloudLightning, Droplet } from 'lucide-react';
import { AiCropAnalysis, CropSecurityRisk } from '@/types';

interface CropHealthRiskDashboardProps {
  analysis: AiCropAnalysis;
  risk: CropSecurityRisk;
}

export const CropHealthRiskDashboard: React.FC<CropHealthRiskDashboardProps> = ({
  analysis,
  risk,
}) => {
  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-500/25 text-rose-300 border-rose-500/50 font-black tracking-wider shadow';
      case 'HIGH':
        return 'bg-amber-500/25 text-amber-300 border-amber-500/50 font-extrabold shadow';
      case 'MODERATE':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 font-bold shadow';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold shadow';
    }
  };

  const getHealthStatusLabel = (score: number) => {
    if (score > 75) return { label: 'OPTIMAL / GOOD', color: 'text-emerald-400' };
    if (score > 45) return { label: 'MODERATE STRESS', color: 'text-yellow-400' };
    if (score > 25) return { label: 'POOR / VULNERABLE', color: 'text-amber-400' };
    return { label: 'CRITICAL / DEGRADED', color: 'text-rose-400' };
  };

  const healthStatus = getHealthStatusLabel(analysis.cropHealthScore);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* AI Crop Health Index Card */}
      <div className="lg:col-span-5 glass-card p-5 lg:p-6 space-y-5 border-2 border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
          <h3 className="text-sm font-extrabold text-emerald-300 uppercase tracking-wide flex items-center gap-1.5 font-heading">
            <Activity className="w-4 h-4 text-emerald-400" /> AI Crop Health Index
          </h3>
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-950 text-amber-300 border border-emerald-500/30 shadow">
            HEALTH METRIC
          </span>
        </div>

        {/* Big Health Score Gauge */}
        <div className="flex items-center justify-between p-4.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/30 shadow-inner">
          <div>
            <span className="text-xs text-emerald-300/80 uppercase font-mono font-semibold">Foliar Health Score</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-black text-white tracking-tight font-heading">{analysis.cropHealthScore}</span>
              <span className="text-sm text-emerald-400 font-bold">/ 100</span>
            </div>
            <span className={`inline-block mt-1 text-[11px] font-black uppercase tracking-wider ${healthStatus.color}`}>
              {healthStatus.label}
            </span>
          </div>

          {/* Meter Badge */}
          <div className="w-20 h-20 rounded-full border-4 border-emerald-500/30 flex flex-col items-center justify-center bg-emerald-950 relative shadow-xl glow-border-emerald">
            <span className="text-lg font-black text-amber-300 font-heading">{analysis.cropHealthScore}%</span>
            <span className="text-[9px] text-emerald-400/80 font-mono font-extrabold">HEALTH</span>
          </div>
        </div>

        {/* Health Stress Breakdown */}
        <div className="space-y-3 text-xs">
          <span className="text-emerald-300/90 font-bold block uppercase tracking-wider text-[11px] font-mono">
            Pathology Stress Breakdown:
          </span>

          <div>
            <div className="flex justify-between text-[11px] mb-1 font-mono">
              <span className="text-emerald-200 font-medium">Active Pathogen Impact</span>
              <span className="text-rose-400 font-black">-{analysis.healthBreakdown.diseaseImpact} pts</span>
            </div>
            <div className="w-full h-2.5 bg-emerald-950 rounded-full overflow-hidden border border-emerald-500/20 shadow-inner">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: `${analysis.healthBreakdown.diseaseImpact}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1 font-mono">
              <span className="text-emerald-200 font-medium">Visible Foliar Tissue Damage</span>
              <span className="text-amber-400 font-black">-{analysis.healthBreakdown.visibleDamage} pts</span>
            </div>
            <div className="w-full h-2.5 bg-emerald-950 rounded-full overflow-hidden border border-emerald-500/20 shadow-inner">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${analysis.healthBreakdown.visibleDamage}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1 font-mono">
              <span className="text-emerald-200 font-medium">Microclimate Environmental Stress</span>
              <span className="text-emerald-300 font-black">-{analysis.healthBreakdown.environmentalStress} pts</span>
            </div>
            <div className="w-full h-2.5 bg-emerald-950 rounded-full overflow-hidden border border-emerald-500/20 shadow-inner">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${analysis.healthBreakdown.environmentalStress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Agricultural Security & Risk Matrix Dashboard */}
      <div className="lg:col-span-7 glass-card p-5 lg:p-6 space-y-4 border-2 border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
          <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wide flex items-center gap-1.5 font-heading">
            <AlertOctagon className="w-4 h-4 text-amber-400" /> Agricultural Security & Risk Dashboard
          </h3>
          <span className="text-[11px] text-emerald-300 font-mono">
            Overall Risk: <span className="font-black text-amber-300">{risk.overallRiskLevel} ({risk.overallRiskScore}/100)</span>
          </span>
        </div>

        {/* 4 Risk Category Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Disease Risk */}
          <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/30 space-y-1 shadow">
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-300 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Disease Risk
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] border ${getRiskBadge(risk.diseaseRisk)}`}>
                {risk.diseaseRisk}
              </span>
            </div>
            <p className="text-[10px] text-emerald-400/70 mt-1">Foliar pathogen expansion & spore pressure</p>
          </div>

          {/* Pest Pressure */}
          <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/30 space-y-1 shadow">
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-300 font-bold flex items-center gap-1">
                <Bug className="w-3.5 h-3.5 text-orange-400" /> Pest Pressure
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] border ${getRiskBadge(risk.pestRisk)}`}>
                {risk.pestRisk}
              </span>
            </div>
            <p className="text-[10px] text-emerald-400/70 mt-1">Vector insect & chewing pest threat</p>
          </div>

          {/* Climate Risk */}
          <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/30 space-y-1 shadow">
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-300 font-bold flex items-center gap-1">
                <CloudLightning className="w-3.5 h-3.5 text-cyan-400" /> Climate Risk
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] border ${getRiskBadge(risk.climateRisk)}`}>
                {risk.climateRisk}
              </span>
            </div>
            <p className="text-[10px] text-emerald-400/70 mt-1">Rain wash-off & wind drift risk</p>
          </div>

          {/* Water Stress */}
          <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/30 space-y-1 shadow">
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-300 font-bold flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5 text-blue-400" /> Water Stress
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] border ${getRiskBadge(risk.waterStressRisk)}`}>
                {risk.waterStressRisk}
              </span>
            </div>
            <p className="text-[10px] text-emerald-400/70 mt-1">Drought or root waterlogging risk</p>
          </div>
        </div>

        {/* Primary Contributing Risk Factor */}
        <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-xs text-amber-200 shadow">
          <span className="font-black text-amber-400">Primary Risk Factor: </span>
          {risk.primaryRiskFactor}
        </div>
      </div>
    </div>
  );
};

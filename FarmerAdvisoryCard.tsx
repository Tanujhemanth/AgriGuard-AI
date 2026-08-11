'use client';

import React, { useState } from 'react';
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sprout,
  FlaskConical,
  HardHat,
  HelpCircle,
  Printer,
} from 'lucide-react';
import { DecisionEngineOutput } from '@/types';

interface FarmerAdvisoryCardProps {
  advisory: DecisionEngineOutput;
  onOpenPrintModal: () => void;
}

export const FarmerAdvisoryCard: React.FC<FarmerAdvisoryCardProps> = ({ advisory, onOpenPrintModal }) => {
  const [activeTreatmentTab, setActiveTreatmentTab] = useState<'organic' | 'chemical'>('organic');

  const getActionBanner = () => {
    switch (advisory.action_status) {
      case 'ACT_NOW':
        return {
          title: 'RECOMMENDED ACTION: ACT NOW',
          subtitle: 'Weather conditions are favorable for immediate treatment application.',
          bg: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100',
          badgeBg: 'bg-emerald-500 text-emerald-950',
          icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
        };
      case 'WAIT':
        return {
          title: 'RECOMMENDED ACTION: WAIT & POSTPONE SPRAY',
          subtitle: 'Adverse weather risk detected (Rain wash-off or High wind drift).',
          bg: 'bg-amber-950/90 border-amber-500/50 text-amber-100',
          badgeBg: 'bg-amber-500 text-emerald-950',
          icon: <Clock className="w-6 h-6 text-amber-400" />,
        };
      default:
        return {
          title: 'RECOMMENDED ACTION: MONITOR & CULTURAL CONTROL',
          subtitle: 'Mild pathology severity or moderate confidence. Avoid unnecessary chemical exposure.',
          bg: 'bg-blue-950/90 border-blue-500/50 text-blue-100',
          badgeBg: 'bg-blue-500 text-emerald-950',
          icon: <AlertCircle className="w-6 h-6 text-blue-400" />,
        };
    }
  };

  const banner = getActionBanner();

  return (
    <div className="glass-card p-5 lg:p-7 space-y-6 relative border-2 border-emerald-500/30 shadow-2xl">
      {/* Prominent Action Banner Header */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${banner.bg} shadow-lg`}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 shadow-inner">
            {banner.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-0.5 rounded-full text-xs font-black tracking-wider uppercase shadow ${banner.badgeBg}`}>
                {advisory.action_status}
              </span>
              <span className="text-xs text-emerald-200/80 font-mono">Deterministic Decision Engine</span>
            </div>
            <h2 className="text-lg font-black text-white mt-1 font-heading">{banner.title}</h2>
            <p className="text-xs text-emerald-200/90 mt-0.5">{banner.subtitle}</p>
          </div>
        </div>

        {/* Share & Print Quick Actions */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={onOpenPrintModal}
            className="px-3.5 py-2 bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-500/40 text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow active:scale-95"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" /> Export PDF / Print
          </button>
        </div>
      </div>

      {/* 4 Core Questions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QUESTION 1: WHAT'S WRONG */}
        <div className="p-4.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/20 space-y-3 shadow">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
            <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wide flex items-center gap-1.5 font-heading">
              1. What is Wrong with the Crop?
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
              Severity: {advisory.whatsWrong.severityLabel}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-emerald-300/70 font-medium">Target Crop:</span>
              <span className="font-bold text-white">{advisory.whatsWrong.crop}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-300/70 font-medium">Identified Condition:</span>
              <span className="font-extrabold text-amber-300">{advisory.whatsWrong.condition}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-300/70 font-medium">Pathogen Classification:</span>
              <span className="font-bold text-emerald-200">{advisory.whatsWrong.pathogenType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-300/70 font-medium">AI Diagnostic Confidence:</span>
              <span className="font-black text-amber-400 font-mono">{advisory.whatsWrong.confidence}%</span>
            </div>
          </div>
        </div>

        {/* QUESTION 2: WHEN TO ACT */}
        <div className="p-4.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/20 space-y-3 shadow">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
            <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wide flex items-center gap-1.5 font-heading">
              2. When is it Suitable to Act?
            </h3>
            <span className="text-xs font-bold text-emerald-300 bg-emerald-900/60 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
              {advisory.action_status}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-emerald-300/70 font-medium block">Optimal Treatment Timing Window:</span>
              <p className="text-xs font-bold text-white bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-500/20 mt-1">
                {advisory.timing_guidance.suggestedTimeWindow}
              </p>
            </div>

            <div>
              <span className="text-emerald-300/70 font-medium block mb-1">Weather Signals Evaluated:</span>
              <div className="flex flex-wrap gap-1.5">
                {advisory.timing_guidance.weatherFactors.map((wf: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-emerald-900/80 text-[11px] text-emerald-200 border border-emerald-500/30">
                    • {wf}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* QUESTION 3: HOW TO RESPOND */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 space-y-4 shadow">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wide flex items-center gap-1.5 font-heading">
                3. How Should the Farmer Respond?
              </h3>
              <p className="text-xs text-emerald-300/80 mt-0.5 font-medium">{advisory.treatment_guidance.summary}</p>
            </div>

            {/* Treatment Protocol Tabs */}
            <div className="flex items-center gap-1 bg-emerald-900/80 p-1 rounded-xl border border-emerald-500/30">
              <button
                onClick={() => setActiveTreatmentTab('organic')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  activeTreatmentTab === 'organic'
                    ? 'bg-emerald-500 text-emerald-950 shadow'
                    : 'text-emerald-300 hover:text-white'
                }`}
              >
                <Sprout className="w-3.5 h-3.5" /> Organic & Bio-Control
              </button>
              <button
                onClick={() => setActiveTreatmentTab('chemical')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  activeTreatmentTab === 'chemical'
                    ? 'bg-amber-500 text-emerald-950 shadow'
                    : 'text-emerald-300 hover:text-white'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5" /> Targeted Chemical
              </button>
            </div>
          </div>

          {/* Action List Content */}
          {activeTreatmentTab === 'organic' ? (
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Sprout className="w-4 h-4 text-emerald-400" /> Sustainable Organic & Bio-Fungicide Measures:
              </span>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {advisory.treatment_guidance.organic.map((act: string, i: number) => (
                  <li key={i} className="text-xs text-emerald-100 bg-emerald-900/40 p-3 rounded-xl border border-emerald-500/20 flex items-start gap-2 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <FlaskConical className="w-4 h-4 text-amber-400" /> Targeted Chemical Intervention & Dosage Guidelines:
              </span>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {advisory.treatment_guidance.chemical.map((act: string, i: number) => (
                  <li key={i} className="text-xs text-amber-100 bg-amber-950/40 p-3 rounded-xl border border-amber-500/30 flex items-start gap-2 shadow-sm">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Safety & PPE Requirements */}
          <div className="pt-2 border-t border-emerald-500/20">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-2">
              <HardHat className="w-4 h-4 text-amber-400" /> Operator Safety & Personal Protective Equipment (PPE):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {advisory.treatment_guidance.ppe.map((ppe: string, i: number) => (
                <div key={i} className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/20 text-[11px] text-emerald-300 shadow-sm">
                  • {ppe}
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-emerald-400/80 italic border-t border-emerald-500/20 pt-2">
            {advisory.treatment_guidance.followProductLabelNotice}
          </p>
        </div>

        {/* QUESTION 4: WHY (EXPLAINABLE REASONING) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-emerald-950/50 border border-emerald-500/20 space-y-3 shadow">
          <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wide flex items-center gap-1.5 font-heading">
            <HelpCircle className="w-4 h-4 text-amber-400" /> 4. Why This Recommendation? (Explainable Decision Trail)
          </h3>
          
          <div className="space-y-2">
            <ol className="space-y-2 text-xs text-emerald-200">
              {advisory.reasons.map((step: string, i: number) => (
                <li key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-900/30 border border-emerald-500/20 shadow-sm">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="mt-0.5">{step}</span>
                </li>
              ))}
            </ol>

            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 mt-2 shadow">
              <span className="font-bold text-amber-400">Micro-Climate Risk Analysis: </span>
              {advisory.weatherRiskExplanation}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

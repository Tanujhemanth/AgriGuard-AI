'use client';

import React from 'react';
import { X, Printer, Share2, CheckCircle2, Leaf } from 'lucide-react';
import { CompleteAnalysisReport } from '@/types';

interface AdvisoryPrintModalProps {
  report: CompleteAnalysisReport;
  onClose: () => void;
}

export const AdvisoryPrintModal: React.FC<AdvisoryPrintModalProps> = ({ report, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsapp = () => {
    const text = encodeURIComponent(
      `🌾 *AgriGuard AI Field Advisory* 🌾\n` +
      `*Crop:* ${report.aiAnalysis.cropName}\n` +
      `*Condition:* ${report.aiAnalysis.conditionName} (${report.aiAnalysis.severityPct}% severity)\n` +
      `*Action:* ${report.advisory.action_status}\n` +
      `*Optimal Time:* ${report.advisory.timing_guidance.suggestedTimeWindow}\n` +
      `*Location:* ${report.weather.locationName}\n` +
      `*Weather:* ${report.weather.currentTempC}°C, Rain Prob ${report.weather.rainProbabilityPct}%, Wind ${report.weather.windSpeedKmH} km/h`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-emerald-950 border-2 border-emerald-500/40 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative text-white">
        {/* Modal Controls */}
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-emerald-950 font-bold">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Official Agronomic Advisory Certificate</h3>
              <p className="text-xs text-emerald-300/70">ID: {report.id} • {new Date(report.timestamp).toLocaleString()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Content Certificate */}
        <div id="printable-advisory" className="space-y-4 bg-emerald-900/20 p-5 rounded-xl border border-emerald-500/30">
          <div className="flex justify-between items-start border-b border-emerald-500/20 pb-3">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">AgriGuard AI Field Advisory</span>
              <h4 className="text-lg font-extrabold text-white">{report.aiAnalysis.conditionName}</h4>
              <p className="text-xs text-emerald-300">Crop: <span className="font-semibold text-white">{report.aiAnalysis.cropName}</span> | Location: <span className="font-semibold text-white">{report.weather.locationName}</span></p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-emerald-950 shadow">
                {report.advisory.action_status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-emerald-950/80 rounded-lg border border-emerald-500/20">
              <span className="text-emerald-300/70 font-medium">AI Confidence:</span>
              <p className="font-extrabold text-amber-400 text-base">{report.aiAnalysis.confidenceScore}%</p>
            </div>
            <div className="p-3 bg-emerald-950/80 rounded-lg border border-emerald-500/20">
              <span className="text-emerald-300/70 font-medium">Disease Severity:</span>
              <p className="font-extrabold text-amber-300 text-base">{report.aiAnalysis.severityPct}% ({report.advisory.whatsWrong.severityLabel})</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <span className="font-bold text-amber-300 block">Recommended Action & Timing:</span>
            <p className="p-2.5 bg-emerald-950/80 rounded-lg border border-emerald-500/20 text-emerald-100">
              {report.advisory.timing_guidance.suggestedTimeWindow}
            </p>

            <span className="font-bold text-emerald-300 block pt-1">Primary Response Protocol:</span>
            <ul className="space-y-1">
              {report.advisory.treatment_guidance.organic.slice(0, 2).map((act: string, idx: number) => (
                <li key={idx} className="flex items-start gap-1.5 text-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[10px] text-emerald-400/60 pt-2 border-t border-emerald-500/20 italic">
            This document is generated by AgriGuard AI decision support system. Follow official agricultural product labels and local safety regulations.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={handleShareWhatsapp}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-emerald-950 font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <Share2 className="w-4 h-4" /> Share via WhatsApp
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
};

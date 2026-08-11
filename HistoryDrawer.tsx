'use client';

import React from 'react';
import { X, History, Trash2, ChevronRight, Leaf, Calendar } from 'lucide-react';
import { CompleteAnalysisReport } from '@/types';

interface HistoryDrawerProps {
  reports: CompleteAnalysisReport[];
  onSelectReport: (report: CompleteAnalysisReport) => void;
  onClearHistory: () => void;
  onClose: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  reports,
  onSelectReport,
  onClearHistory,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end">
      <div className="bg-emerald-950 border-l border-emerald-500/30 w-full max-w-md h-full flex flex-col p-5 space-y-4 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Past Field Advisories ({reports.length})</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
          {reports.length === 0 ? (
            <div className="text-center py-12 text-emerald-400/60 space-y-2">
              <Leaf className="w-10 h-10 mx-auto text-emerald-600" />
              <p className="text-xs">No saved agronomic scans found in local memory.</p>
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                onClick={() => {
                  onSelectReport(report);
                  onClose();
                }}
                className="p-3.5 rounded-xl bg-emerald-900/40 border border-emerald-500/20 hover:border-amber-400/60 cursor-pointer transition flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{report.aiAnalysis.cropName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-amber-400 border border-emerald-500/30">
                      {report.advisory.action_status}
                    </span>
                  </div>
                  <p className="text-xs text-amber-300 font-semibold">{report.aiAnalysis.conditionName}</p>
                  <p className="text-[10px] text-emerald-400/70 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-emerald-400" />
                    {new Date(report.timestamp).toLocaleString()}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition" />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {reports.length > 0 && (
          <div className="pt-3 border-t border-emerald-500/20">
            <button
              onClick={onClearHistory}
              className="w-full py-2.5 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 text-rose-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <Trash2 className="w-4 h-4" /> Clear All History
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

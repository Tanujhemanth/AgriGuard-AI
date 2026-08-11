'use client';

import React, { useState } from 'react';
import { AiCropAnalysis } from '@/types';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileCheck,
  Scan,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface AiDiagnosisCardProps {
  analysis: AiCropAnalysis;
  imageUri: string | null;
}

export const AiDiagnosisCard: React.FC<AiDiagnosisCardProps> = ({
  analysis,
  imageUri,
}) => {
  const [showOverlay, setShowOverlay] = useState<boolean>(true);

  const getPathogenColor = (type: string) => {
    switch (type) {
      case 'Fungal':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Bacterial':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Viral':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Pest':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'Healthy':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="glass-card p-6 lg:p-7 space-y-6 border-2 border-emerald-500/30 shadow-2xl relative overflow-hidden">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2 font-heading">
              Computer Vision Pathology Scanner
            </h2>
            <p className="text-xs text-emerald-300/80">
              Taxon: <span className="font-bold text-white">{analysis.cropName || 'Crop'}</span> ({analysis.botanicalName || 'Taxon'})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950 text-amber-300 border border-emerald-500/40 shadow">
            Confidence: {analysis.confidenceScore}%
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow ${getPathogenColor(analysis.pathogenType)}`}>
            {analysis.pathogenType}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image with Laser Scanner & Lesion Hotspots */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-black/60 shadow-2xl group">
            {imageUri ? (
              // eslint-disable-next-html-element-suppress
              <img
                src={imageUri}
                alt={analysis.conditionName || 'Crop Disease Preview'}
                className="w-full h-64 object-cover"
              />
            ) : (
              <div className="w-full h-64 bg-emerald-950 flex items-center justify-center text-emerald-400 font-bold text-xs">
                No Image Preview Available
              </div>
            )}

            {/* Pulsing Scan Line Animation */}
            <div className="animate-scan-line" />

            {/* Bounding Box Lesion Hotspot Overlay */}
            {showOverlay && analysis.lesionHighlights?.map((box, idx) => (
              <div
                key={idx}
                className="absolute border-2 border-amber-400 bg-amber-400/20 rounded-md animate-pulse shadow-lg flex items-start justify-start p-1"
                style={{
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.width}%`,
                  height: `${box.height}%`,
                }}
              >
                <span className="bg-amber-500 text-amber-950 text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                  {box.label}
                </span>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setShowOverlay(!showOverlay)}
              className="absolute bottom-3 right-3 px-3 py-1.5 bg-emerald-950/85 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 text-[11px] font-bold rounded-xl flex items-center gap-1.5 shadow transition"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              {showOverlay ? 'Hide Lesion Hotspots' : 'Show Lesion Hotspots'}
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/20 text-xs text-emerald-300 space-y-1.5 shadow-inner">
            <div className="flex justify-between font-mono">
              <span>Foliar Architecture:</span>
              <span className="text-white font-bold">{analysis.leafArchitecture || 'Foliar Architecture'}</span>
            </div>
            <div className="flex justify-between font-mono">
              <span>Surface Lesion Coverage:</span>
              <span className="text-amber-400 font-bold">{analysis.severityPct}% Lamina Impact</span>
            </div>
          </div>
        </div>

        {/* Right Column: Pathology Details & Visible Symptoms */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-900/40 border border-emerald-500/30 space-y-2 shadow">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-400">
              Primary Diagnosed Pathology:
            </span>
            <h3 className="text-xl font-black text-white flex items-center gap-2 font-heading">
              {analysis.conditionName || 'Pathology Detected'}
            </h3>
            <p className="text-xs text-emerald-200/90 leading-relaxed font-medium">
              {analysis.visible_damage}
            </p>
          </div>

          {/* Visible Foliar Symptoms */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <Scan className="w-4 h-4 text-emerald-400" />
              Verified Visual Symptoms:
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {analysis.visibleSymptoms?.map((symptom, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/20 text-xs text-emerald-100 shadow-sm"
                >
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{symptom}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Criteria & Security Metrics */}
          {analysis.exactVerificationCriteria && analysis.exactVerificationCriteria.length > 0 && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-xs space-y-2 shadow">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5 text-amber-400" /> Automated Verification Signatures:
              </div>
              <ul className="space-y-1 text-emerald-200/90 text-[11px]">
                {analysis.exactVerificationCriteria.map((c, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Health & Quality Score Gauges */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/20 text-center shadow">
              <div className="text-[10px] text-emerald-400/80 uppercase font-mono font-bold">Crop Health Score</div>
              <div className="text-2xl font-black text-emerald-300 mt-1 font-heading">{analysis.cropHealthScore}/100</div>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/20 text-center shadow">
              <div className="text-[10px] text-emerald-400/80 uppercase font-mono font-bold">Visual Quality Score</div>
              <div className="text-2xl font-black text-amber-300 mt-1 font-heading">{analysis.visualQualityScore}/100</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
